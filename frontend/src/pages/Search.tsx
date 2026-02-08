import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, User, FileText, Loader2, Filter } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import PostCard from '../components/PostCard';
import { Post } from '../types';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'users'>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ users: any[], posts: Post[] }>({ users: [], posts: [] });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  // Auto switch tab based on query input
  useEffect(() => {
    if (query.startsWith('@')) {
      setActiveTab('users');
    }
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Update URL without reloading
      setSearchParams({ q: query });
      
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4 min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-slate-900 z-10 pb-4 pt-2">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
          <SearchIcon className="text-blue-600" /> Tìm kiếm
        </h1>
        
        <div className="relative mb-4">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết hoặc nhập @để tìm người dùng..."
            className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white shadow-sm transition-all"
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-blue-500" size={20} />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'posts' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            <FileText size={16} /> Bài viết
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            <User size={16} /> Mọi người
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6 mt-2 animate-in fade-in duration-500">
        {!query && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nhập từ khóa để bắt đầu tìm kiếm</p>
          </div>
        )}

        {/* Users Results */}
        {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
          <div className="space-y-4">
            {activeTab === 'all' && <h3 className="font-bold text-lg text-gray-900 dark:text-white">Mọi người</h3>}
            <div className="grid gap-4 animate-in slide-in-from-bottom-4 duration-500">
              {results.users.map(user => (
                <div key={user._id} onClick={() => navigate(`/profile/${user._id}`)} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <img 
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`} 
                    alt={user.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{user.full_name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                    {user.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{user.bio}</p>}
                  </div>
                  <button className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                    Xem
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Results */}
        {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
          <div className="space-y-4">
            {activeTab === 'all' && <h3 className="font-bold text-lg text-gray-900 dark:text-white mt-6">Bài viết</h3>}
            {results.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {query && !loading && results.users.length === 0 && results.posts.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Không tìm thấy kết quả nào cho "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;