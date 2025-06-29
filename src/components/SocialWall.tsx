import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { WallService } from '../services/wallService';
import { WallPost as WallPostType } from '../types/database';
import { useAuth } from '../context/AuthContext';
import WallPost from './WallPost';

interface SocialWallProps {
  targetUserId: string;
  canPost?: boolean;
}

const SocialWall: React.FC<SocialWallProps> = ({ targetUserId, canPost = true }) => {
  const [posts, setPosts] = useState<(WallPostType & { authorInfo: any })[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { user } = useAuth();
  const wallService = WallService.getInstance();

  useEffect(() => {
    loadPosts();
  }, [targetUserId]);

  const loadPosts = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await wallService.getWallPosts(targetUserId, page, 10);
      if (response.success && response.data) {
        if (page === 1) {
          setPosts(response.data);
        } else {
          setPosts(prev => [...prev, ...response.data]);
        }
        setHasMore(response.pagination.page < response.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading wall posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user?.id || !newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await wallService.createWallPost(user.id, targetUserId, newPostContent.trim());
      if (response.success) {
        setNewPostContent('');
        loadPosts(); // Reload posts
      } else {
        alert(response.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating wall post:', error);
      alert('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadPosts(currentPage + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleCreatePost();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Wall Posts</h2>
      </div>

      {/* Create Post Form */}
      {canPost && user && (
        <div className="bg-fantasy-900/30 border border-fantasy-700/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-10 h-10 rounded-full border-2 border-yellow-400"
            />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write something on this wall... (Ctrl+Enter to post)"
                className="w-full p-3 bg-fantasy-800/50 border border-fantasy-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                rows={3}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-gray-400 text-sm">
                  {newPostContent.length}/500 characters
                </span>
                <button
                  onClick={handleCreatePost}
                  disabled={isSubmitting || !newPostContent.trim() || newPostContent.length > 500}
                  className="flex items-center space-x-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-midnight-900 font-bold rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading && posts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No posts yet. Be the first to write something!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <WallPost
                key={post._id}
                post={post}
                onUpdate={() => loadPosts()}
              />
            ))}
            
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2 bg-fantasy-700 hover:bg-fantasy-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SocialWall;