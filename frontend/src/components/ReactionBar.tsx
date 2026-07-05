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
    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
      <button 
        className={`flex items-center gap-1.5 transition-all duration-300 group active:scale-90 ${userReaction ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-red-500'}`} 
        onClick={(e) => { e.stopPropagation(); onReaction('like'); }}
      >
        <div className={`p-2 rounded-full transition-all duration-300 transform group-hover:scale-110 ${userReaction ? 'bg-red-50 dark:bg-red-500/10' : 'group-hover:bg-red-50 dark:group-hover:bg-red-500/10'}`}>
          <Heart className={`w-[18px] h-[18px] transition-transform duration-300 ${userReaction ? 'fill-current scale-110 text-red-500' : 'group-hover:text-red-500'}`} />
        </div>
        <span className="text-xs tracking-wider transition-colors duration-300">{likes}</span>
      </button>
      
      <button 
        className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all duration-300 group active:scale-90" 
        onClick={(e) => { e.stopPropagation(); onComment && onComment(); }}
      >
        <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all duration-300 transform group-hover:scale-110">
          <MessageCircle className="w-[18px] h-[18px] transition-colors duration-300 group-hover:text-blue-500" />
        </div>
        <span className="text-xs tracking-wider transition-colors duration-300">{comments}</span>
      </button>
      
      <button 
        className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-green-500 transition-all duration-300 group active:scale-90" 
        onClick={(e) => { e.stopPropagation(); onShare && onShare(); }}
      >
        <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-500/10 transition-all duration-300 transform group-hover:scale-110">
          <Share2 className="w-[18px] h-[18px] transition-colors duration-300 group-hover:text-green-500" />
        </div>
        <span className="text-xs tracking-wider transition-colors duration-300">{shares}</span>
      </button>
    </div>
  );
};

export default ReactionBar;
