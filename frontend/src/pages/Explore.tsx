import React from 'react';
import { Hash } from 'lucide-react';

const Explore = () => {
  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Hash className="text-blue-600" /> Khám phá</h1>
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Hash className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Xu hướng mới</h3>
        <p className="text-gray-500 mt-2">Tính năng khám phá các chủ đề nóng đang được phát triển.</p>
      </div>
    </div>
  );
};

export default Explore;