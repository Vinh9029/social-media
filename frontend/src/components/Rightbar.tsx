import React from 'react';
import { Search, TrendingUp } from 'lucide-react';

const Rightbar = () => {
  return (
    <aside className="hidden lg:block w-80 p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="relative mb-6 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
          <TrendingUp size={20} className="text-blue-600" />
          Xu hướng
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Đang thịnh hành tại Việt Nam</p>
              <p className="font-bold text-gray-900">#CongNgheMoi</p>
              <p className="text-xs text-gray-400 mt-0.5">12.5K bài viết</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Rightbar;