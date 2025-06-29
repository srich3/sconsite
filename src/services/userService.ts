import DatabaseService from './database';
import { DATABASE_TABLES } from '../config/database';
import { UserProfile, ApiResponse } from '../types/database';

export class UserService {
  private static instance: UserService;
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async createUser(userData: Omit<UserProfile, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<UserProfile>> {
    try {
      const supabase = this.dbService.getClient();

      console.log('Creating user with Discord ID:', userData.discordId);

      // Check if user already exists with this Discord ID
      const { data: existingUser, error: checkError } = await supabase
        .from(DATABASE_TABLES.USERS)
        .select('*')
        .eq('discord_id', userData.discordId)
        .maybeSingle();

      // Log the check error for debugging
      if (checkError) {
        console.log('Check error (this might be normal):', checkError);
      }

      if (existingUser) {
        console.log('User already exists with Discord ID:', userData.discordId);
        return {
          success: false,
          error: 'User already exists with this Discord ID'
        };
      }

      const now = new Date().toISOString();
      const newUser = {
        discord_id: userData.discordId, // Primary identifier
        username: userData.username,
        discriminator: userData.discriminator,
        global_name: userData.globalName,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio || '',
        join_date: userData.joinDate?.toISOString() || now,
        last_active: userData.lastActive?.toISOString() || now,
        is_online: userData.isOnline || true,
        settings: userData.settings || {
          allowWallPosts: true,
          showOnlineStatus: true,
          profilePrivate: false,
          notifications: {
            guildAnnouncements: true,
            friendRequests: true,
            eventReminders: false,
          }
        },
        stats: userData.stats || {
          totalSessions: 1,
          totalAchievements: 0,
          joinedGuilds: 0,
        },
        created_at: now,
        updated_at: now
      };

      console.log('Attempting to insert user:', { discord_id: newUser.discord_id, username: newUser.username });

      const { data, error } = await supabase
        .from(DATABASE_TABLES.USERS)
        .insert(newUser)
        .select()
        .single();

      if (error) {
        console.error('Database error creating user:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`
        };
      }

      console.log('User created successfully:', data.discord_id);
      return {
        success: true,
        data: this.transformUserFromDb(data),
        message: 'User profile created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: 'Failed to create user profile'
      };
    }
  }

  async getUserByDiscordId(discordId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const supabase = this.dbService.getClient();

      console.log('Looking up user by Discord ID:', discordId);

      // Use a more explicit query approach
      const { data, error, count } = await supabase
        .from(DATABASE_TABLES.USERS)
        .select('*', { count: 'exact' })
        .eq('discord_id', discordId);

      console.log('Query result:', { data, error, count });

      if (error) {
        console.error('Database error fetching user:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`
        };
      }

      if (!data || data.length === 0) {
        console.log('User not found with Discord ID:', discordId);
        return {
          success: false,
          error: 'User not found'
        };
      }

      const user = data[0]; // Get the first (and should be only) result
      console.log('User found:', user.username);
      return {
        success: true,
        data: this.transformUserFromDb(user)
      };
    } catch (error) {
      console.error('Error fetching user by Discord ID:', error);
      return {
        success: false,
        error: 'Failed to fetch user'
      };
    }
  }

  async updateUser(discordId: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const supabase = this.dbService.getClient();

      console.log('Updating user with Discord ID:', discordId);

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Map the updates to database column names
      if (updates.username !== undefined) updateData.username = updates.username;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.discriminator !== undefined) updateData.discriminator = updates.discriminator;
      if (updates.globalName !== undefined) updateData.global_name = updates.globalName;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.settings !== undefined) updateData.settings = updates.settings;
      if (updates.stats !== undefined) updateData.stats = updates.stats;
      if (updates.isOnline !== undefined) updateData.is_online = updates.isOnline;

      const { data, error } = await supabase
        .from(DATABASE_TABLES.USERS)
        .update(updateData)
        .eq('discord_id', discordId)
        .select()
        .single();

      if (error) {
        console.error('Failed to update user:', error);
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      console.log('User updated successfully');
      return {
        success: true,
        data: this.transformUserFromDb(data),
        message: 'User updated successfully'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }

  async updateLastActive(discordId: string): Promise<void> {
    try {
      const supabase = this.dbService.getClient();

      console.log('Updating last active for Discord ID:', discordId);

      const { error } = await supabase
        .from(DATABASE_TABLES.USERS)
        .update({
          last_active: new Date().toISOString(),
          is_online: true,
          updated_at: new Date().toISOString()
        })
        .eq('discord_id', discordId);

      if (error) {
        console.error('Failed to update last active:', error);
      }
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  }

  async setUserOffline(discordId: string): Promise<void> {
    try {
      const supabase = this.dbService.getClient();

      console.log('Setting user offline for Discord ID:', discordId);

      const { error } = await supabase
        .from(DATABASE_TABLES.USERS)
        .update({
          is_online: false,
          updated_at: new Date().toISOString()
        })
        .eq('discord_id', discordId);

      if (error) {
        console.error('Failed to set user offline:', error);
      }
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  }

  async searchUsers(query: string, limit: number = 10): Promise<ApiResponse<UserProfile[]>> {
    try {
      const supabase = this.dbService.getClient();

      console.log('Searching users with query:', query);

      const { data, error } = await supabase
        .from(DATABASE_TABLES.USERS)
        .select('*')
        .or(`username.ilike.%${query}%,global_name.ilike.%${query}%`)
        .not('settings->>profilePrivate', 'eq', 'true')
        .limit(limit);

      if (error) {
        console.error('Error searching users:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data.map(user => this.transformUserFromDb(user))
      };
    } catch (error) {
      console.error('Error searching users:', error);
      return {
        success: false,
        error: 'Failed to search users'
      };
    }
  }

  async deleteUser(discordId: string): Promise<ApiResponse<boolean>> {
    try {
      const supabase = this.dbService.getClient();

      console.log('Deleting user with Discord ID:', discordId);

      const { error } = await supabase
        .from(DATABASE_TABLES.USERS)
        .delete()
        .eq('discord_id', discordId);

      if (error) {
        console.error('Failed to delete user:', error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log('User deleted successfully');
      return {
        success: true,
        data: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }
  }

  async getUserStats(discordId: string): Promise<ApiResponse<any>> {
    try {
      const supabase = this.dbService.getClient();

      console.log('Getting user stats for Discord ID:', discordId);

      // Get user's basic stats
      const { data: user, error: userError } = await supabase
        .from(DATABASE_TABLES.USERS)
        .select('stats, created_at')
        .eq('discord_id', discordId)
        .single();

      if (userError || !user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Get additional stats from other tables
      const [
        { count: wallPostsCount },
        { count: friendsCount },
        { count: charactersCount }
      ] = await Promise.all([
        supabase
          .from(DATABASE_TABLES.WALL_POSTS)
          .select('*', { count: 'exact', head: true })
          .eq('author_id', discordId),
        supabase
          .from(DATABASE_TABLES.FRIENDSHIPS)
          .select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${discordId},addressee_id.eq.${discordId}`)
          .eq('status', 'accepted'),
        supabase
          .from(DATABASE_TABLES.CHARACTERS)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', discordId)
      ]);

      const stats = {
        ...user.stats,
        wallPosts: wallPostsCount || 0,
        friends: friendsCount || 0,
        characters: charactersCount || 0,
        memberSince: user.created_at
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        success: false,
        error: 'Failed to fetch user stats'
      };
    }
  }

  private transformUserFromDb(dbUser: any): UserProfile {
    return {
      _id: dbUser.id,
      discordId: dbUser.discord_id, // This is the primary identifier
      username: dbUser.username,
      discriminator: dbUser.discriminator,
      globalName: dbUser.global_name,
      email: dbUser.email,
      avatar: dbUser.avatar,
      bio: dbUser.bio,
      joinDate: new Date(dbUser.join_date),
      lastActive: new Date(dbUser.last_active),
      isOnline: dbUser.is_online,
      settings: dbUser.settings,
      stats: dbUser.stats,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at)
    };
  }
}

export default UserService;