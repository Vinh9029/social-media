import React from 'react';
import { Bookmark } from 'lucide-react';

const Saved = () => {
  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Bookmark className="text-blue-600" /> Đã lưu</h1>
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Bài viết đã lưu</h3>
        <p className="text-gray-500 mt-2">Lưu lại các bài viết thú vị để xem lại sau.</p>
      </div>
    </div>
  );
};

export default Saved;