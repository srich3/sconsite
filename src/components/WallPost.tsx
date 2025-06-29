import React, { useState } from 'react';
import { Heart, MessageCircle, Edit, Trash2, Send } from 'lucide-react';
import { WallPost as WallPostType, WallPostReply } from '../types/database';
import { WallService } from '../services/wallService';
import { useAuth } from '../context/AuthContext';

interface WallPostProps {
  post: WallPostType & { authorInfo: any };
  onUpdate: () => void;
}

const WallPost: React.FC<WallPostProps> = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const wallService = WallService.getInstance();

  React.useEffect(() => {
    if (user?.id) {
      setIsLiked(post.likes.includes(user.id));
    }
  }, [post.likes, user?.id]);

  const handleLike = async () => {
    if (!user?.id) return;

    try {
      const response = await wallService.likePost(post._id!, user.id);
      if (response.success) {
        setIsLiked(response.data!);
        onUpdate();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleReply = async () => {
    if (!user?.id || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await wallService.addReply(post._id!, user.id, replyContent.trim());
      if (response.success) {
        setReplyContent('');
        setShowReplyForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!user?.id || !editContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await wallService.updatePost(post._id!, user.id, editContent.trim());
      if (response.success) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id) return;

    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await wallService.deletePost(post._id!, user.id);
        if (response.success) {
          onUpdate();
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const canEdit = user?.id === post.authorId;
  const canDelete = user?.id === post.authorId || user?.id === post.targetUserId;

  return (
    <div className="bg-fantasy-800/30 border border-fantasy-700/30 rounded-lg p-4">
      <div className="flex items-start space-x-3 mb-3">
        <img
          src={post.authorInfo.avatar}
          alt={post.authorInfo.username}
          className="w-10 h-10 rounded-full border-2 border-yellow-400"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">
                {post.authorInfo.globalName || post.authorInfo.username}
              </h4>
              <p className="text-gray-400 text-sm">
                {new Date(post.createdAt).toLocaleDateString()} at{' '}
                {new Date(post.createdAt).toLocaleTimeString()}
              </p>
            </div>
            
            {(canEdit || canDelete) && (
              <div className="flex space-x-2">
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 bg-fantasy-900/50 border border-fantasy-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            rows={3}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={isSubmitting || !editContent.trim()}
              className="px-4 py-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-midnight-900 font-medium rounded transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.likes.length}</span>
          </button>
          
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.replies.length}</span>
          </button>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mb-4 p-3 bg-fantasy-900/30 rounded-lg">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-2 bg-fantasy-800/50 border border-fantasy-700/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            rows={2}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => setShowReplyForm(false)}
              className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReply}
              disabled={isSubmitting || !replyContent.trim()}
              className="flex items-center space-x-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting...' : 'Reply'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {post.replies.length > 0 && (
        <div className="space-y-3">
          {post.replies.map((reply: WallPostReply, index: number) => (
            <div key={reply._id || index} className="flex items-start space-x-3 pl-4 border-l-2 border-fantasy-700/30">
              <div className="w-8 h-8 bg-fantasy-700 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {reply.authorId.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-white">User</span>
                  <span className="text-xs text-gray-400">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WallPost;