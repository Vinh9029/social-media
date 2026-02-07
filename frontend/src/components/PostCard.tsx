import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
          />
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{post.author.name}</h3>
            <p className="text-xs text-gray-500">@{post.author.username} • {post.timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="text-gray-800 mb-3 whitespace-pre-line leading-relaxed text-[15px]">
        {post.content}
      </p>

      {post.image && (
        <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group">
          <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
            <Heart size={20} className={post.liked ? "fill-red-500 text-red-500" : ""} />
          </div>
          <span className="text-sm font-medium group-hover:text-red-500">{post.likes}</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
          <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
            <MessageCircle size={20} />
          </div>
          <span className="text-sm font-medium group-hover:text-blue-500">{post.comments}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group">
          <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
            <Share2 size={20} />
          </div>
          <span className="text-sm font-medium group-hover:text-green-500">{post.shares}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;