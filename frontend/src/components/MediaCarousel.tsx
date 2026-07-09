import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Video } from 'lucide-react';

interface MediaCarouselProps {
  mediaUrls: string[];
  onMediaClick?: (index: number) => void;
}

const isMediaVideo = (url: string) => {
  return url.match(/\.(mp4|webm|ogg)$/i) || url.includes('/video/upload/');
};

const AutoPlayVideo = ({ src, onClick }: { src: string; onClick?: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(e => console.log('Auto-play prevented:', e));
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={onClick}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
      />
      <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 text-white z-10">
        <Video size={16} />
      </div>
    </div>
  );
};

const MediaCarousel: React.FC<MediaCarouselProps> = ({ mediaUrls, onMediaClick }) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={mediaUrls.length > 1}
        pagination={mediaUrls.length > 1 ? { clickable: true } : false}
        className="w-full h-[400px] sm:h-[500px]"
      >
        {mediaUrls.map((url, index) => (
          <SwiperSlide key={index}>
            {isMediaVideo(url) ? (
              <AutoPlayVideo src={url} onClick={() => onMediaClick?.(index)} />
            ) : (
              <img
                src={url}
                onClick={() => onMediaClick?.(index)}
                alt={`Media ${index}`}
                className="w-full h-full object-cover cursor-pointer"
                loading="lazy"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MediaCarousel;
