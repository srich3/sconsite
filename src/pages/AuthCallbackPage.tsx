import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { DiscordAuthService } from '../services/discordAuth';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  // Use ref to prevent multiple executions
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      // Mark as processed immediately to prevent re-runs
      hasProcessed.current = true;

      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      console.log('Auth callback triggered with:', { code: !!code, error, state: !!state });

      // Add initial delay to ensure proper state management
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(10);

      if (error) {
        setStatus('error');
        setErrorMessage(`Discord OAuth error: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received from Discord');
        return;
      }

      setProgress(25);

      // Validate state parameter to prevent CSRF attacks (only if state is provided)
      if (state) {
        const discordAuth = DiscordAuthService.getInstance();
        if (!discordAuth.validateState(state)) {
          setStatus('error');
          setErrorMessage('Invalid state parameter - please try logging in again');
          return;
        }
      } else {
        console.warn('No state parameter received - this may indicate an issue with the OAuth flow');
      }

      setProgress(40);

      try {
        console.log('Starting authentication process...');
        setProgress(50);
        
        // Attempt login with the authorization code
        await login(code);
        
        setProgress(80);
        
        // Add another delay to ensure the login process completes
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setProgress(100);
        setStatus('success');
        
        // Redirect to home page after successful login
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } catch (err) {
        console.error('Authentication error:', err);
        
        // Add delay before showing error to avoid premature failure detection
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        setStatus('error');
        
        // Provide more helpful error messages
        let errorMsg = 'Login failed';
        if (err instanceof Error) {
          if (err.message.includes('Code verifier not found')) {
            errorMsg = 'Authentication session expired. Please try logging in again.';
          } else if (err.message.includes('Discord token expired')) {
            errorMsg = 'Discord session expired. Please try logging in again.';
          } else if (err.message.includes('Failed to create user profile')) {
            errorMsg = 'Failed to create your profile. Please try again or contact support.';
          } else if (err.message.includes('Invalid state parameter')) {
            errorMsg = 'Security validation failed. Please try logging in again.';
          } else if (err.message.includes('Invalid "code"')) {
            errorMsg = 'Authentication code expired or already used. Please try logging in again.';
          } else {
            errorMsg = err.message;
          }
        }
        
        setErrorMessage(errorMsg);
      }
    };

    handleCallback();
  }, []); // Empty dependency array to run only once

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      hasProcessed.current = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-yellow-400 mx-auto mb-6 animate-spin" />
              <h2 className="font-fantasy text-3xl font-bold text-white mb-4">
                Authenticating...
              </h2>
              <p className="text-gray-300 mb-6">
                Please wait while we verify your Discord account and set up your profile.
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-fantasy-800 rounded-full h-2 mb-6">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="bg-fantasy-900/30 border border-fantasy-700/30 rounded-lg p-4">
                <div className="space-y-3">
                  <div className={`flex items-center space-x-3 text-sm ${progress >= 25 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${progress >= 25 ? 'bg-yellow-400' : 'bg-gray-400'} ${progress < 25 ? 'animate-pulse' : ''}`}></div>
                    <span>Verifying Discord credentials...</span>
                  </div>
                  <div className={`flex items-center space-x-3 text-sm ${progress >= 60 ? 'text-blue-400' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${progress >= 60 ? 'bg-blue-400' : 'bg-gray-400'} ${progress >= 25 && progress < 60 ? 'animate-pulse' : ''}`}></div>
                    <span>Setting up your profile...</span>
                  </div>
                  <div className={`flex items-center space-x-3 text-sm ${progress >= 100 ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-400' : 'bg-gray-400'} ${progress >= 60 && progress < 100 ? 'animate-pulse' : ''}`}></div>
                    <span>Finalizing authentication...</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <h2 className="font-fantasy text-3xl font-bold text-white mb-4">
                Welcome, Adventurer!
              </h2>
              <p className="text-gray-300 mb-4">
                Successfully authenticated with Discord and set up your profile.
              </p>
              <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4 mb-4">
                <p className="text-emerald-400 text-sm">
                  ✅ Discord account verified<br />
                  ✅ Profile created/updated<br />
                  ✅ Ready to adventure!
                </p>
              </div>
              <p className="text-gray-400 text-sm">
                Redirecting you to the homepage...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h2 className="font-fantasy text-3xl font-bold text-white mb-4">
                Authentication Failed
              </h2>
              <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">
                  {errorMessage}
                </p>
              </div>
              
              {(errorMessage.includes('session expired') || 
                errorMessage.includes('Invalid state parameter') || 
                errorMessage.includes('code expired') ||
                errorMessage.includes('already used')) && (
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>This can happen if you refreshed the page during login, took too long to complete the process, or there was a security validation issue.</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/', { replace: true })}
                  className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-midnight-900 font-bold rounded-lg transition-colors"
                >
                  Return to Homepage
                </button>
                <button
                  onClick={() => {
                    // Clear any stored auth data and reload
                    localStorage.clear();
                    window.location.href = '/';
                  }}
                  className="w-full px-4 py-2 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-midnight-900 font-bold rounded-lg transition-colors"
                >
                  Try Logging In Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;