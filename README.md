# Pathfinder 2e Westmarch Server

A professional web application for managing Pathfinder 2e Westmarch campaigns with Discord integration and Supabase database.

## Features

- **Discord OAuth Authentication** - Secure login with Discord using PKCE flow
- **User Profiles** - Comprehensive user management with social features
- **Character Management** - Create and manage Pathfinder 2e characters with FoundryVTT integration
- **File Management** - Upload, download, and manage FoundryVTT JSON character files
- **Social Features** - Wall posts, friend system, and user search
- **Guild System** - Browse and join player guilds with ranks and badges
- **News & Events** - Stay updated with server announcements and community events
- **Mobile-Responsive Design** - Beautiful dark fantasy theme that works on all devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling with custom fantasy theme
- **React Router** for navigation
- **Lucide React** for icons
- **Context API** for state management

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security (RLS)** for data protection
- **Discord OAuth 2.0** with PKCE for authentication
- **File storage** using browser localStorage (development)

### Key Services
- `UserService` - User profile management
- `CharacterService` - Character creation and management
- `FileService` - FoundryVTT file upload/download
- `FriendService` - Friend relationships and requests
- `WallService` - Social wall posts and interactions
- `DiscordAuthService` - Discord OAuth integration

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Discord Application (for OAuth)
- Supabase Project

### 1. Discord OAuth Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "OAuth2" section
4. Add your redirect URI:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
5. Copy your Client ID (Client Secret is not needed for PKCE flow)

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. The database schema will be automatically created via migrations

### 3. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your configuration: 

```env
# Discord OAuth
VITE_DISCORD_CLIENT_ID=your_discord_client_id_here
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback

# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

### Core Tables

- **users** - User profiles with Discord integration
- **characters** - Player character sheets and data
- **wall_posts** - Social wall posts with likes and replies
- **friendships** - Friend relationships and requests
- **guilds** - Player guilds and organizations
- **guild_memberships** - User-guild relationship data

### Key Features

#### User Management
- Discord OAuth integration with automatic profile sync
- Customizable bio and privacy settings
- Activity tracking and online status
- User search and discovery

#### Character System
- Full Pathfinder 2e character creation
- FoundryVTT JSON file upload/download
- Character file management with main file selection
- Automatic data parsing from FoundryVTT files
- Character activation/deactivation

#### Social Features
- User wall posts with likes and replies
- Friend request system
- User search and friend management
- Privacy controls and settings

#### File Management
- Upload FoundryVTT character JSON files
- Set main character file for data display
- Download character files
- Parse character data (name, level, stats, etc.)

## Character File Integration

The application supports FoundryVTT character files:

1. **Upload** - Users can upload `.json` character files
2. **Parse** - Automatically extracts character data:
   - Name, level, class, race
   - Age, height, weight
   - Backstory and appearance
   - Wealth and equipment
   - Character avatar/image
3. **Display** - Shows parsed data on character cards
4. **Download** - Users can download their files anytime

## Security Features

- **Discord OAuth 2.0** with PKCE (no client secret in frontend)
- **Row Level Security** on all database tables
- **Input validation** and sanitization
- **Privacy controls** for user profiles
- **Secure file handling** with type validation

## Development Features

### Authentication Flow
1. User clicks "Login with Discord"
2. Redirected to Discord OAuth with PKCE
3. Discord redirects back with authorization code
4. Code exchanged for access token
5. User profile created/updated in database
6. User logged in and redirected to dashboard

### File Upload Process
1. User selects FoundryVTT JSON file
2. File validated (type, size, JSON format)
3. Character data parsed and extracted
4. File stored with metadata
5. Character card updated with parsed data

### Database Migrations
- Automatic schema creation via Supabase migrations
- Row Level Security policies for data protection
- Optimized indexes for performance
- Foreign key constraints for data integrity

## API Structure

### Service Layer
- `DatabaseService` - Core database connection
- `UserService` - User CRUD operations
- `CharacterService` - Character management
- `FileService` - File upload/download
- `FriendService` - Social relationships
- `WallService` - Social posts
- `DiscordAuthService` - OAuth handling

### Type Safety
- Full TypeScript integration
- Comprehensive type definitions
- API response types
- Database model types

## Deployment

### Environment Variables for Production

```env
VITE_DISCORD_CLIENT_ID=your_production_discord_client_id
VITE_DISCORD_REDIRECT_URI=https://yourdomain.com/auth/callback
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Production Checklist

1. **Discord OAuth** - Update redirect URI for production domain
2. **Supabase** - Configure production database
3. **Environment** - Set production environment variables
4. **Build** - Run `npm run build` for optimized build
5. **Deploy** - Deploy to your hosting platform

## Troubleshooting

### Authentication Issues
- Verify Discord OAuth configuration
- Check redirect URI matches exactly
- Ensure environment variables are loaded
- Clear localStorage and try again

### Database Issues
- Check Supabase connection and credentials
- Verify RLS policies are correctly configured
- Ensure migrations have been applied
- Check browser console for detailed errors

### File Upload Issues
- Ensure file is valid JSON format
- Check file size (max 5MB)
- Verify file contains FoundryVTT character data
- Check browser console for parsing errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section above
- Review the browser console for error messages
- Ensure all environment variables are correctly set
- Verify Discord and Supabase configurations

## Roadmap

- [ ] Real-time messaging system
- [ ] Advanced guild management
- [ ] Campaign session scheduling
- [ ] Achievement system
- [ ] Mobile app development
- [ ] Advanced character sheet features
- [ ] Integration with more VTT platforms