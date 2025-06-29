export const DISCORD_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_DISCORD_CLIENT_ID || '',
  REDIRECT_URI: import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  SCOPES: ['identify', 'email'].join(' '),
  API_ENDPOINT: 'https://discord.com/api/v10',
  CDN_ENDPOINT: 'https://cdn.discordapp.com',
};

export const getDiscordAvatarUrl = (userId: string, avatarHash: string, size = 128) => {
  return `${DISCORD_CONFIG.CDN_ENDPOINT}/avatars/${userId}/${avatarHash}.png?size=${size}`;
};