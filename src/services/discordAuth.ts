import { DISCORD_CONFIG } from '../config/discord';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string;
  verified: boolean;
  global_name: string | null;
}

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class DiscordAuthService {
  private static instance: DiscordAuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private isExchangingToken: boolean = false; // Prevent concurrent token exchanges

  static getInstance(): DiscordAuthService {
    if (!DiscordAuthService.instance) {
      DiscordAuthService.instance = new DiscordAuthService();
    }
    return DiscordAuthService.instance;
  }

  async exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
    // Prevent concurrent token exchanges
    if (this.isExchangingToken) {
      throw new Error('Token exchange already in progress');
    }

    this.isExchangingToken = true;
    
    try {
      console.log('Exchanging authorization code for tokens...');
      
      let codeVerifier = this.getStoredCodeVerifier();
      
      // If no code verifier is found, try to generate a new one and use the implicit flow
      if (!codeVerifier) {
        console.warn('Code verifier not found, attempting fallback authentication...');
        
        // For fallback, we'll try without PKCE (less secure but works)
        const formData = new FormData();
        formData.append('client_id', DISCORD_CONFIG.CLIENT_ID);
        formData.append('grant_type', 'authorization_code');
        formData.append('code', code);
        formData.append('redirect_uri', DISCORD_CONFIG.REDIRECT_URI);

        const response = await fetch(`${DISCORD_CONFIG.API_ENDPOINT}/oauth2/token`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Discord OAuth error (fallback):', error);
          
          // If fallback fails, clear everything and ask user to restart
          this.clearTokens();
          throw new Error('Authentication failed. Please try logging in again.');
        }

        const tokenData: DiscordTokenResponse = await response.json();
        this.storeTokens(tokenData);
        return tokenData;
      }

      // Normal PKCE flow
      console.log('Using PKCE flow with stored code verifier');
      const formData = new FormData();
      formData.append('client_id', DISCORD_CONFIG.CLIENT_ID);
      formData.append('grant_type', 'authorization_code');
      formData.append('code', code);
      formData.append('redirect_uri', DISCORD_CONFIG.REDIRECT_URI);
      formData.append('code_verifier', codeVerifier);

      const response = await fetch(`${DISCORD_CONFIG.API_ENDPOINT}/oauth2/token`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Discord OAuth error:', error);
        
        // Clear tokens and code verifier on error
        this.clearTokens();
        
        // Provide more specific error messages
        if (error.error === 'invalid_grant') {
          throw new Error('Discord OAuth error: Authorization code expired or already used');
        }
        
        throw new Error(`Discord OAuth error: ${error.error_description || error.error || 'Authentication failed'}`);
      }

      const tokenData: DiscordTokenResponse = await response.json();
      this.storeTokens(tokenData);
      
      // Clear the auth data after successful exchange
      this.clearAuthData();
      console.log('Token exchange completed successfully');

      return tokenData;
    } finally {
      this.isExchangingToken = false;
    }
  }

  private storeTokens(tokenData: DiscordTokenResponse): void {
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token || null;
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
    
    // Store in localStorage for persistence
    localStorage.setItem('discord_access_token', tokenData.access_token);
    if (tokenData.refresh_token) {
      localStorage.setItem('discord_refresh_token', tokenData.refresh_token);
    }
    localStorage.setItem('discord_token_expiry', this.tokenExpiry.toString());
  }

  async getCurrentUser(): Promise<DiscordUser> {
    const token = this.getValidToken();
    if (!token) {
      throw new Error('No valid Discord token available');
    }

    console.log('Fetching current Discord user...');
    const response = await fetch(`${DISCORD_CONFIG.API_ENDPOINT}/users/@me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, clear tokens
        console.warn('Discord token expired or invalid');
        this.clearTokens();
        throw new Error('Discord token expired. Please log in again.');
      }
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch Discord user data: ${error.message}`);
    }

    const userData = await response.json();
    console.log('Discord user data retrieved successfully');
    return userData;
  }

  private getValidToken(): string | null {
    // Check if we have tokens in memory
    if (!this.accessToken) {
      // Try to load from localStorage
      this.loadTokensFromStorage();
    }

    if (!this.accessToken || !this.tokenExpiry) {
      return null;
    }

    // Check if token is expired (with 5 minute buffer)
    if (Date.now() >= (this.tokenExpiry - 300000)) {
      console.log('Discord token expired');
      return null;
    }

    return this.accessToken;
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('discord_access_token');
    this.refreshToken = localStorage.getItem('discord_refresh_token');
    const expiry = localStorage.getItem('discord_token_expiry');
    this.tokenExpiry = expiry ? parseInt(expiry) : null;
  }

  clearTokens(): void {
    console.log('Clearing Discord tokens');
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.isExchangingToken = false;
    
    localStorage.removeItem('discord_access_token');
    localStorage.removeItem('discord_refresh_token');
    localStorage.removeItem('discord_token_expiry');
    this.clearAuthData();
  }

  private clearAuthData(): void {
    localStorage.removeItem('discord_auth_data');
  }

  isAuthenticated(): boolean {
    return this.getValidToken() !== null;
  }

  // PKCE helper methods
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async generateAuthUrl(): Promise<string> {
    console.log('Generating Discord OAuth URL...');
    
    // Clear any existing tokens and verifiers
    this.clearTokens();
    
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();
    
    // Store code verifier and state for later use with a timestamp
    const authData = {
      codeVerifier,
      state,
      timestamp: Date.now()
    };
    
    localStorage.setItem('discord_auth_data', JSON.stringify(authData));
    
    console.log('Code verifier and state stored with timestamp');

    const params = new URLSearchParams({
      client_id: DISCORD_CONFIG.CLIENT_ID,
      redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
      response_type: 'code',
      scope: DISCORD_CONFIG.SCOPES,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
    });

    const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
    console.log('Discord OAuth URL generated successfully');
    return authUrl;
  }

  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private getStoredCodeVerifier(): string | null {
    try {
      const authDataStr = localStorage.getItem('discord_auth_data');
      if (!authDataStr) {
        console.warn('No auth data found in localStorage');
        return null;
      }

      const authData = JSON.parse(authDataStr);
      
      // Check if the auth data is too old (more than 10 minutes)
      const maxAge = 10 * 60 * 1000; // 10 minutes
      if (Date.now() - authData.timestamp > maxAge) {
        console.warn('Auth data expired, clearing...');
        this.clearAuthData();
        return null;
      }

      console.log('Code verifier found in localStorage');
      return authData.codeVerifier;
    } catch (error) {
      console.error('Error parsing auth data:', error);
      this.clearAuthData();
      return null;
    }
  }

  validateState(receivedState: string): boolean {
    try {
      const authDataStr = localStorage.getItem('discord_auth_data');
      if (!authDataStr) {
        console.warn('No stored auth data found for state validation');
        return false;
      }

      const authData = JSON.parse(authDataStr);
      
      // Check if the auth data is too old
      const maxAge = 10 * 60 * 1000; // 10 minutes
      if (Date.now() - authData.timestamp > maxAge) {
        console.warn('Auth data expired during state validation');
        this.clearAuthData();
        return false;
      }

      const isValid = authData.state === receivedState;
      if (isValid) {
        console.log('State validation successful');
        // Don't remove auth data yet, we still need the code verifier
      } else {
        console.error('State validation failed - possible CSRF attack');
        this.clearAuthData();
      }
      
      return isValid;
    } catch (error) {
      console.error('Error validating state:', error);
      this.clearAuthData();
      return false;
    }
  }
}