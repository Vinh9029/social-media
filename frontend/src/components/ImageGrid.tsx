import React from 'react';
import { motion } from 'framer-motion';

interface ImageGridProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick }) => {
  if (!images || images.length === 0) return null;

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (onImageClick) onImageClick(index);
  };

  const len = images.length;

  if (len === 1) {
    return (
      <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
        <img 
          src={images[0]} 
          onClick={(e) => handleImageClick(e, 0)}
          alt="Post content" 
          className="w-full h-auto object-cover max-h-[500px] cursor-pointer" 
          loading="lazy" 
        />
      </div>
    );
  }

  if (len === 2) {
    return (
      <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 flex gap-1 h-[400px]">
        <img src={images[0]} onClick={(e) => handleImageClick(e, 0)} className="w-1/2 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
        <img src={images[1]} onClick={(e) => handleImageClick(e, 1)} className="w-1/2 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
      </div>
    );
  }

  if (len === 3) {
    return (
      <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 flex gap-1 h-[400px]">
        <img src={images[0]} onClick={(e) => handleImageClick(e, 0)} className="w-1/2 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
        <div className="w-1/2 flex flex-col gap-1 h-full">
          <img src={images[1]} onClick={(e) => handleImageClick(e, 1)} className="w-full h-1/2 object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
          <img src={images[2]} onClick={(e) => handleImageClick(e, 2)} className="w-full h-1/2 object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
        </div>
      </div>
    );
  }

  if (len === 4) {
    return (
      <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col gap-1 h-[500px]">
        <img src={images[0]} onClick={(e) => handleImageClick(e, 0)} className="w-full h-2/3 object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
        <div className="w-full h-1/3 flex gap-1">
          <img src={images[1]} onClick={(e) => handleImageClick(e, 1)} className="w-1/3 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
          <img src={images[2]} onClick={(e) => handleImageClick(e, 2)} className="w-1/3 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
          <img src={images[3]} onClick={(e) => handleImageClick(e, 3)} className="w-1/3 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
        </div>
      </div>
    );
  }

  // len >= 5
  return (
    <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col gap-1 h-[500px]">
      <img src={images[0]} onClick={(e) => handleImageClick(e, 0)} className="w-full h-2/3 object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
      <div className="w-full h-1/3 flex gap-1">
        <img src={images[1]} onClick={(e) => handleImageClick(e, 1)} className="w-1/3 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
        <img src={images[2]} onClick={(e) => handleImageClick(e, 2)} className="w-1/3 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
        <div className="w-1/3 h-full relative cursor-pointer group" onClick={(e) => handleImageClick(e, 3)}>
          <img src={images[3]} className="w-full h-full object-cover" loading="lazy" />
          {len > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <span className="text-white text-2xl font-bold">+{len - 4}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGrid;
