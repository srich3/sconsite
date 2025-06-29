import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DiscordAuthService, DiscordUser } from '../services/discordAuth';
import { getDiscordAvatarUrl } from '../config/discord';
import { UserService } from '../services/userService';
import { UserProfile } from '../types/database';
import { supabase } from '../config/database';

interface User {
  id: string;
  username: string;
  avatar: string;
  email: string;
  discriminator?: string;
  globalName?: string | null;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  login: (code: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const discordAuth = DiscordAuthService.getInstance();
  const userService = UserService.getInstance();

  useEffect(() => {
    // Check if user is already authenticated on app load
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (discordAuth.isAuthenticated()) {
        const discordUser = await discordAuth.getCurrentUser();
        const transformedUser = transformDiscordUser(discordUser);
        
        // Get or create user profile in database using Discord ID
        await syncUserProfile(transformedUser);
        
        setUser(transformedUser);
      }
    } catch (err) {
      console.error('Failed to initialize auth:', err);
      // Clear invalid tokens
      discordAuth.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const syncUserProfile = async (user: User) => {
    try {
      console.log('Syncing user profile for Discord ID:', user.id);
      
      // Create a temporary Supabase user session for database operations
      // This is a workaround since we're using Discord OAuth instead of Supabase Auth
      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) {
        console.warn('Failed to create anonymous session:', signInError);
      }
      
      // Try to get existing user profile using Discord ID
      const existingUserResponse = await userService.getUserByDiscordId(user.id);
      
      if (existingUserResponse.success && existingUserResponse.data) {
        console.log('Found existing user profile, updating...');
        
        // Update existing user's last active and basic info
        await userService.updateLastActive(user.id);
        
        // Update user info in case Discord profile changed
        const updateResponse = await userService.updateUser(user.id, {
          username: user.username,
          avatar: user.avatar,
          email: user.email,
          discriminator: user.discriminator,
          globalName: user.globalName,
          isOnline: true
        });

        if (updateResponse.success && updateResponse.data) {
          user.profile = updateResponse.data;
          console.log('User profile updated successfully');
        } else {
          console.warn('Failed to update user profile:', updateResponse.error);
          // Still use the existing profile even if update failed
          user.profile = existingUserResponse.data;
        }
      } else {
        console.log('No existing user profile found, creating new one...');
        
        // Create new user profile with Discord ID as primary identifier
        const newUserData = {
          discordId: user.id, // Discord ID is the primary key
          username: user.username,
          discriminator: user.discriminator,
          globalName: user.globalName,
          email: user.email,
          avatar: user.avatar,
          bio: '',
          joinDate: new Date(),
          lastActive: new Date(),
          isOnline: true,
          settings: {
            allowWallPosts: true,
            showOnlineStatus: true,
            profilePrivate: false,
            notifications: {
              guildAnnouncements: true,
              friendRequests: true,
              eventReminders: false,
            }
          },
          stats: {
            totalSessions: 1, // First login
            totalAchievements: 0,
            joinedGuilds: 0,
          }
        };

        const newUserResponse = await userService.createUser(newUserData);

        if (newUserResponse.success && newUserResponse.data) {
          user.profile = newUserResponse.data;
          console.log('New user profile created successfully');
        } else {
          console.error('Failed to create user profile:', newUserResponse.error);
          throw new Error(`Failed to create user profile: ${newUserResponse.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to sync user profile:', error);
      throw error; // Re-throw to handle in login function
    }
  };

  const login = async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting login process with authorization code...');

      // Exchange code for tokens
      await discordAuth.exchangeCodeForToken(code);
      console.log('Successfully exchanged code for tokens');
      
      // Get user data from Discord
      const discordUser = await discordAuth.getCurrentUser();
      console.log('Retrieved Discord user data:', discordUser.username);
      
      const transformedUser = transformDiscordUser(discordUser);
      
      // Sync with database - this will create or update the user profile
      await syncUserProfile(transformedUser);
      console.log('User profile sync completed');
      
      setUser(transformedUser);
      console.log('Login process completed successfully');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      // Clear tokens on login failure
      discordAuth.clearTokens();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (user?.id) {
      console.log('Setting user offline before logout...');
      // Set user offline in database
      await userService.setUserOffline(user.id);
    }
    
    // Sign out from Supabase as well
    await supabase.auth.signOut();
    
    discordAuth.clearTokens();
    setUser(null);
    setError(null);
    console.log('Logout completed');
  };

  const refreshUserProfile = async () => {
    if (!user?.id) return;

    try {
      console.log('Refreshing user profile...');
      const userResponse = await userService.getUserByDiscordId(user.id);
      if (userResponse.success && userResponse.data) {
        setUser(prev => prev ? { ...prev, profile: userResponse.data } : null);
        console.log('User profile refreshed successfully');
      } else {
        console.warn('Failed to refresh user profile:', userResponse.error);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  const transformDiscordUser = (discordUser: DiscordUser): User => {
    const avatar = discordUser.avatar 
      ? getDiscordAvatarUrl(discordUser.id, discordUser.avatar)
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator) % 5}.png`;

    return {
      id: discordUser.id, // This is the Discord ID that will be used as primary key
      username: discordUser.global_name || discordUser.username,
      avatar,
      email: discordUser.email,
      discriminator: discordUser.discriminator,
      globalName: discordUser.global_name,
    };
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      isLoading, 
      error,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};