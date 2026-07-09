import { Heart, MessageCircle, Share2, ThumbsUp, Smile, Flame } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  likes: number;
  comments: number;
  shares: number;
  userReaction?: string;
  onReaction: (type: string) => void;
  onComment?: () => void;
  onShare?: () => void;
}

const REACTIONS = [
  { type: 'like', icon: ThumbsUp, label: 'Thích', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', fill: true },
  { type: 'love', icon: Heart, label: 'Yêu thích', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', fill: true },
  { type: 'haha', icon: Smile, label: 'Haha', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10', fill: false },
  { type: 'wow', icon: Flame, label: 'Tuyệt vời', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', fill: false },
];

const ReactionBar: React.FC<Props> = ({ likes, comments, shares, userReaction, onReaction, onComment, onShare }) => {
  const [showReactions, setShowReactions] = useState(false);
  let hoverTimeout: ReturnType<typeof setTimeout>;

  const activeReaction = REACTIONS.find(r => r.type === userReaction);
  const ActiveIcon = activeReaction?.icon || Heart;

  const handleMouseEnterLike = () => {
    hoverTimeout = setTimeout(() => setShowReactions(true), 300);
  };
  const handleMouseLeaveLike = () => {
    clearTimeout(hoverTimeout);
    setTimeout(() => setShowReactions(false), 300);
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50 select-none">

      {/* Like / Reaction */}
      <div className="relative" onMouseEnter={handleMouseEnterLike} onMouseLeave={handleMouseLeaveLike}>
        {/* Reaction popup */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-full px-3 py-2 shadow-xl border border-slate-100 dark:border-slate-700 z-20"
            >
              {REACTIONS.map(r => {
                const Icon = r.icon;
                return (
                  <motion.button
                    key={r.type}
                    whileHover={{ scale: 1.35, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onReaction(r.type); setShowReactions(false); }}
                    title={r.label}
                    className={`p-1.5 rounded-full ${r.bg} ${r.color} transition-all`}
                  >
                    <Icon size={18} className={r.fill && userReaction === r.type ? 'fill-current' : ''} />
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className={`flex items-center gap-1.5 transition-all duration-200 group active:scale-90 ${userReaction ? `${activeReaction?.color} font-semibold` : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'}`}
          onClick={(e) => { e.stopPropagation(); onReaction('like'); }}
        >
          <div className={`p-2 rounded-full transition-all duration-200 group-hover:scale-110 ${userReaction ? `${activeReaction?.bg}` : 'group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10'}`}>
            <ActiveIcon
              className={`w-[18px] h-[18px] transition-transform duration-200 ${userReaction ? 'fill-current scale-110' : 'group-hover:text-blue-500'}`}
            />
          </div>
          <span className="text-xs tracking-wide">{likes > 0 ? likes : ''}</span>
        </button>
      </div>

      {/* Comment */}
      <button
        className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all duration-200 group active:scale-90"
        onClick={(e) => { e.stopPropagation(); onComment && onComment(); }}
      >
        <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all duration-200 group-hover:scale-110">
          <MessageCircle className="w-[18px] h-[18px] transition-colors duration-200 group-hover:text-blue-500" />
        </div>
        <span className="text-xs tracking-wide">{comments > 0 ? comments : ''}</span>
      </button>

      {/* Share */}
      <button
        className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-green-500 transition-all duration-200 group active:scale-90"
        onClick={(e) => { e.stopPropagation(); onShare && onShare(); }}
      >
        <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-500/10 transition-all duration-200 group-hover:scale-110">
          <Share2 className="w-[18px] h-[18px] transition-colors duration-200 group-hover:text-green-500" />
        </div>
        <span className="text-xs tracking-wide">{shares > 0 ? shares : ''}</span>
      </button>
    </div>
  );
};

export default ReactionBar;
