import { supabase } from '../config/database';

class DatabaseService {
  private static instance: DatabaseService;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect(): Promise<void> {
    // Supabase handles connection automatically
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    // Supabase handles connection automatically
    return Promise.resolve();
  }

  getClient() {
    return supabase;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      return !error;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export default DatabaseService;