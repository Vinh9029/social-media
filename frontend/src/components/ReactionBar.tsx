import { Heart, MessageCircle, Share2 } from 'lucide-react';
import React from 'react';

interface Props {
  likes: number;
  comments: number;
  shares: number;
  userReaction?: string;
  onReaction: (type: string) => void;
  onComment?: () => void;
  onShare?: () => void;
}

const ReactionBar: React.FC<Props> = ({ likes, comments, shares, userReaction, onReaction, onComment, onShare }) => {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-700">
      <button 
        className={`flex items-center gap-2 transition-colors group ${userReaction ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`} 
        onClick={() => onReaction('like')}
      >
        <div className={`p-2 rounded-full transition-colors ${userReaction ? 'bg-red-50 dark:bg-red-900/20' : 'group-hover:bg-red-50 dark:group-hover:bg-red-900/20'}`}>
          <Heart className={`w-5 h-5 ${userReaction ? 'fill-current' : ''}`} />
        </div>
        <span className="text-sm font-medium group-hover:text-red-500">{likes}</span>
      </button>
      
      <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors group" onClick={onComment}>
        <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
          <MessageCircle className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium group-hover:text-blue-500">{comments}</span>
      </button>
      
      <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors group" onClick={onShare}>
        <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
          <Share2 className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium group-hover:text-green-500">{shares}</span>
      </button>
    </div>
  );
};

export default ReactionBar;
