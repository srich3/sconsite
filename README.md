# Pathfinder 2e Westmarch Server

A professional web application for managing Pathfinder 2e Westmarch campaigns with Discord integration and MongoDB Atlas database.

## Features

- Discord OAuth authentication with PKCE
- MongoDB Atlas database integration
- User profiles with social features
- Character management with FoundryVTT integration
- Guild system with ranks and badges
- Social wall posts and friend system
- News and events system
- Mobile-responsive dark fantasy design

## Setup

### Discord OAuth Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "OAuth2" section
4. Add your redirect URI:
   - For development: `http://localhost:5173/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
5. Copy your Client ID (Client Secret is not needed for PKCE flow)

### Superbase Setup

TODO

### Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your configuration:

```env
# Discord OAuth
VITE_DISCORD_CLIENT_ID=your_discord_client_id_here
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback

# Superbase
```

### Installation

```bash
npm install
npm run dev
```

## Database Schema

### Collections

- **users**: User profiles and settings
- **wall_posts**: Social wall posts with likes and replies
- **friendships**: Friend relationships and requests
- **characters**: Character sheets and FoundryVTT data
- **guilds**: Guild information and settings
- **guild_memberships**: User-guild relationships and roles

### Key Features

#### User Profiles
- Discord integration with automatic profile sync
- Customizable bio and settings
- Privacy controls and notification preferences
- Activity tracking and statistics

#### Social Features
- Wall posts with likes and replies
- Friend requests and management
- User search and discovery
- Block/unblock functionality

#### Database Services
- Automatic indexing for performance
- Connection pooling and error handling
- Data validation and sanitization
- Pagination support for large datasets

## Architecture

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management

### Database
- MongoDB Atlas cloud database
- Mongoose-like service layer
- Automatic schema validation
- Performance optimized queries

### Authentication
- Discord OAuth 2.0 with PKCE
- Secure token management
- Automatic session refresh
- User profile synchronization

## Security Features

- PKCE OAuth flow (no client secret in frontend)
- Input validation and sanitization
- Rate limiting considerations
- Privacy controls for user data
- Secure database connections

## Development

### Database Services

The application includes several service classes:

- `UserService`: User profile management
- `WallService`: Social wall posts and interactions
- `FriendService`: Friend relationships and requests
- `DatabaseService`: Core database connection and utilities

### Adding New Features

1. Define types in `src/types/database.ts`
2. Create service class in `src/services/`
3. Add database indexes in `DatabaseService.createIndexes()`
4. Implement frontend components
5. Update context providers as needed

## Deployment

### Environment Variables for Production

```env
VITE_DISCORD_CLIENT_ID=your_production_discord_client_id
VITE_DISCORD_REDIRECT_URI=https://yourdomain.com/auth/callback
VITE_MONGODB_URI=your_production_mongodb_uri
VITE_DATABASE_NAME=pathfinder_westmarch_prod
```

### MongoDB Atlas Production Setup

1. Create a production cluster
2. Configure IP whitelist for your hosting provider
3. Set up database users with appropriate permissions
4. Enable MongoDB Atlas monitoring and alerts
5. Configure automated backups

## Troubleshooting

### Database Connection Issues
- Verify MongoDB URI format and credentials
- Check IP whitelist in MongoDB Atlas
- Ensure database name exists
- Check network connectivity

### Authentication Issues
- Verify Discord OAuth configuration
- Check redirect URI matches exactly
- Clear localStorage and try again
- Verify environment variables are loaded

### Performance Issues
- Monitor MongoDB Atlas metrics
- Check database indexes are created
- Optimize queries with aggregation pipeline
- Consider implementing caching for frequently accessed data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.