import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, ArrowLeft, User, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';
import { useParams, useNavigate } from 'react-router-dom';
import { Post, Comment } from '../types';

const MOCK_POST: Post = {
  id: '1',
  author: { id: 'u1', name: 'Admin User', username: 'admin', avatar: '', role: 'admin' },
  content: 'Hôm nay trời đẹp quá! Mọi người có kế hoạch gì cho cuối tuần chưa? 🌞',
  likes: 124, comments: 2, shares: 5, timestamp: new Date().toISOString(), liked: true, title: 'Cuối tuần vui vẻ'
};

const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', content: 'Đi chơi thôi!', author: { id: 'u2', name: 'User 2', username: 'user2', avatar: '' } as any, timestamp: new Date().toISOString(), postId: '1' },
  { id: 'c2', content: 'Ở nhà code dạo :(', author: { id: 'u3', name: 'Dev Guy', username: 'devguy', avatar: '' } as any, timestamp: new Date().toISOString(), postId: '1' }
];

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Giả lập fetch data
    if (postId) {
      setPost(MOCK_POST);
      setComments(MOCK_COMMENTS);
    }
  }, [postId]);

  const handleLike = () => {
    if (post) setPost({ ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: user,
      timestamp: new Date().toISOString(),
      postId: postId || ''
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"><User className="w-7 h-7 text-gray-600" /></div>
              <div><h3 className="font-semibold text-gray-900 text-lg">{post.author.name}</h3><p className="text-sm text-gray-500">@{post.author.username} • {formatDistanceToNow(post.timestamp)}</p></div>
            </div>
            <p className="text-gray-700 text-lg whitespace-pre-wrap mb-4">{post.content}</p>
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
              <button onClick={handleLike} className={`flex items-center space-x-2 transition ${post.liked ? 'text-red-500' : 'text-gray-600'}`}><Heart className={`w-6 h-6 ${post.liked ? 'fill-current' : ''}`} /><span className="font-medium">{post.likes}</span></button>
              <div className="flex items-center space-x-2 text-gray-600"><MessageCircle className="w-6 h-6" /><span className="font-medium">{comments.length}</span></div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h3>
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex space-x-3">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                <button type="submit" disabled={!newComment.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Send className="w-4 h-4" /></button>
              </div>
            </form>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-gray-600" /></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1"><span className="font-semibold text-gray-900">{comment.author.name}</span><span className="text-sm text-gray-500">{formatDistanceToNow(comment.timestamp)}</span></div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}