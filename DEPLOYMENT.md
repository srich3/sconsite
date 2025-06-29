# Deployment Guide - Vercel

This guide will help you deploy the Pathfinder 2e Westmarch Server to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Supabase Project**: Already configured
4. **Discord Application**: Already configured

## Step 1: Connect GitHub to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing this project

## Step 2: Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

### Required Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Discord OAuth Configuration  
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_REDIRECT_URI=https://your-vercel-domain.vercel.app/auth/callback
```

### Important Notes:
- Replace `your-vercel-domain` with your actual Vercel domain
- Make sure to update the Discord redirect URI in your Discord application settings
- All variables should be available for **Production**, **Preview**, and **Development**

## Step 3: Update Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **OAuth2 > General**
4. Add your Vercel domain to **Redirects**:
   ```
   https://your-vercel-domain.vercel.app/auth/callback
   ```

## Step 4: Deploy

### Automatic Deployment
- Push to `main` branch triggers automatic deployment
- Pull requests create preview deployments

### Manual Deployment
1. In Vercel dashboard, go to **Deployments**
2. Click **Deploy** button
3. Select branch to deploy

## Step 5: Verify SPA Routing

After deployment, test these URLs directly in the browser:
- `https://your-domain.vercel.app/about` ✅ Should work
- `https://your-domain.vercel.app/auth/callback` ✅ Should work
- `https://your-domain.vercel.app/characters` ✅ Should work

If you still get 404s, check:
1. The `vercel.json` file is in your repository root
2. The `public/_redirects` file exists
3. Redeploy after making these changes

## Step 6: GitHub Actions (Optional)

If you want to use GitHub Actions for CI/CD, add these secrets to your GitHub repository:

### GitHub Secrets Required

Go to your GitHub repository > **Settings > Secrets and variables > Actions**:

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id

# Environment Variables (for build process)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_REDIRECT_URI=https://your-vercel-domain.vercel.app/auth/callback
```

### Getting Vercel Tokens

1. **Vercel Token**: 
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create new token

2. **Org ID & Project ID**:
   - Run `vercel link` in your project directory
   - Check `.vercel/project.json` for IDs

## Step 7: Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings > Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update Discord redirect URI to use custom domain

## Build Configuration

The project uses these build settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

## Environment-Specific URLs

### Development
```bash
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
```

### Production
```bash
VITE_DISCORD_REDIRECT_URI=https://your-domain.com/auth/callback
```

## Troubleshooting

### Common Issues

1. **404 Errors on Direct URLs**
   - Ensure `vercel.json` has proper routing configuration
   - Check `public/_redirects` file exists
   - Redeploy after configuration changes

2. **Build Fails**
   - Check environment variables are set correctly
   - Ensure all dependencies are in `package.json`
   - Check build logs in Vercel dashboard

3. **Discord OAuth Fails**
   - Verify redirect URI matches exactly
   - Check Discord application settings
   - Ensure environment variables are correct

4. **Database Connection Issues**
   - Verify Supabase URL and key
   - Check Supabase project is active
   - Ensure RLS policies allow operations

### Testing SPA Routing

After deployment, test these scenarios:
1. Navigate to `/about` using the navigation menu ✅
2. Refresh the page while on `/about` ✅
3. Enter `/about` directly in the URL bar ✅
4. Test Discord login flow `/auth/callback` ✅

### Logs and Monitoring

- **Build Logs**: Vercel dashboard > Deployments > View logs
- **Runtime Logs**: Vercel dashboard > Functions > View logs
- **Analytics**: Vercel dashboard > Analytics

## Performance Optimization

The deployment includes:

- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic compression
- ✅ Image optimization
- ✅ Edge caching
- ✅ Serverless functions ready
- ✅ SPA routing support

## Security Features

- ✅ Environment variable encryption
- ✅ Automatic security headers
- ✅ DDoS protection
- ✅ SSL/TLS certificates
- ✅ XSS protection headers

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Discord Support**: Check Discord Developer Portal
- **Supabase Support**: Check Supabase documentation

---

Your Pathfinder 2e Westmarch Server is now ready for production deployment on Vercel! 🚀

## Quick Fix Summary

The 404 issue was caused by improper SPA routing configuration. The updated files include:

1. **Enhanced `vercel.json`** - Proper route handling for SPAs
2. **Added `public/_redirects`** - Fallback routing support
3. **Security headers** - Additional protection
4. **Better route prioritization** - API routes, static assets, then SPA fallback

After pushing these changes, your direct URL navigation should work perfectly!