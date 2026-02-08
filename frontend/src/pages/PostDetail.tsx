import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, ArrowLeft, User, Trash2, Send, X, Share2 } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';
import { useParams, useNavigate } from 'react-router-dom';
import { Post, Comment } from '../types';
import { API_URL } from '../config';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  useEffect(() => {
    if (postId) {
      // Fetch Post
      fetch(`${API_URL}/api/posts/${postId}`)
        .then(res => {
          if (!res.ok) throw new Error('Post not found');
          return res.json();
        })
        .then(data => setPost(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));

      // Fetch Comments
      fetch(`${API_URL}/api/posts/${postId}/comments`)
        .then(res => res.json())
        .then(data => setComments(data))
        .catch(err => console.error(err));
    }
  }, [postId]);

  const handleLike = async () => {
    if (!post || !user) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        const likes = await res.json();
        setPost({ ...post, likes: likes.length, liked: !post.liked });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/posts/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        const likes = await res.json();
        setComments(prev => prev.map(c => {
          if (c.id === commentId) {
            return { ...c, likes: likes };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        },
        body: JSON.stringify({ 
          content: newComment,
          parentId: replyingTo ? replyingTo.id : null
        })
      });
      
      if (res.ok) {
        const savedComment = await res.json();
        // Enrich comment with current user info for display
        const commentWithUser: Comment = {
          ...savedComment,
          id: savedComment._id,
          author: user,
          timestamp: new Date().toISOString(),
          postId: postId || '',
          likes: [],
          parentId: replyingTo ? replyingTo.id : null
        };
        setComments([...comments, commentWithUser]);
        setNewComment('');
        setReplyingTo(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper function to build comment tree
  const buildCommentTree = (comments: Comment[]) => {
    const commentMap: { [key: string]: Comment } = {};
    const roots: Comment[] = [];

    // Initialize map and replies array
    comments.forEach(c => {
      commentMap[c.id] = { ...c, replies: [] };
    });

    comments.forEach(c => {
      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies?.push(commentMap[c.id]);
      } else {
        roots.push(commentMap[c.id]);
      }
    });

    return roots;
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
    const isLiked = user && comment.likes?.includes(user.id);
    
    return (
      <div className={`flex flex-col ${depth > 0 ? 'ml-10 mt-3' : 'mt-4'}`}>
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {comment.author.avatar ? (
              <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-2 inline-block transition-colors">
              <div className="font-semibold text-sm text-gray-900 dark:text-white">{comment.author.name}</div>
              <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
            <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>{formatDistanceToNow(comment.timestamp)}</span>
              <button 
                onClick={() => handleLikeComment(comment.id)}
                className={`hover:underline ${isLiked ? 'text-red-500 font-bold' : ''}`}
              >
                Like {comment.likes && comment.likes.length > 0 && `(${comment.likes.length})`}
              </button>
              <button 
                onClick={() => setReplyingTo(comment)}
                className="hover:underline"
              >
                Reply
              </button>
              <button className="hover:underline flex items-center gap-1">
                <Share2 size={12} /> Share
              </button>
            </div>
          </div>
        </div>
        {/* Render Replies Recursively */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-900 dark:text-white">Loading...</div>;
  if (!post) return <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-900 dark:text-white">Post not found</div>;

  const rootComments = buildCommentTree(comments);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-900 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 dark:bg-slate-700 rounded-full flex items-center justify-center"><User className="w-7 h-7 text-gray-600 dark:text-gray-400" /></div>
              <div><h3 className="font-semibold text-gray-900 dark:text-white text-lg">{post.author.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">@{post.author.username} • {formatDistanceToNow(post.timestamp)}</p></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg whitespace-pre-wrap mb-4">{post.content}</p>
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button onClick={handleLike} className={`flex items-center space-x-2 transition ${post.liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}><Heart className={`w-6 h-6 ${post.liked ? 'fill-current' : ''}`} /><span className="font-medium">{post.likes}</span></button>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"><MessageCircle className="w-6 h-6" /><span className="font-medium">{comments.length}</span></div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"><Share2 className="w-6 h-6" /><span className="font-medium">{post.shares}</span></div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 p-6 bg-gray-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comments ({comments.length})</h3>
            
            {/* Comment Input */}
            <form onSubmit={handleSubmitComment} className="mb-6 sticky top-0 z-10 bg-gray-50 dark:bg-slate-800/50 pb-2">
              {replyingTo && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mb-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400">Replying to <b>{replyingTo.author.name}</b></span>
                  <button type="button" onClick={() => setReplyingTo(null)}><X size={14} className="text-gray-500" /></button>
                </div>
              )}
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <button type="submit" disabled={!newComment.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
            </form>
            
            {/* Comment Tree */}
            <div className="space-y-1">
              {rootComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}