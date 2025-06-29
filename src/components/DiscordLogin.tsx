import React, { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { DiscordAuthService } from '../services/discordAuth';

const DiscordLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const discordAuth = DiscordAuthService.getInstance();

  const handleDiscordLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Initiating Discord login...');
      
      // Clear any existing auth data before starting new login
      discordAuth.clearTokens();
      
      const authUrl = await discordAuth.generateAuthUrl();
      console.log('Redirecting to Discord OAuth...');
      
      // Small delay to ensure state is saved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to generate Discord auth URL:', error);
      alert('Failed to start login process. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDiscordLogin}
      disabled={isLoading}
      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
      <span>{isLoading ? 'Connecting...' : 'Login with Discord'}</span>
    </button>
  );
};

export default DiscordLogin;