import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ThemeConfig {
  type: 'color' | 'image';
  value: string;
}

interface ChatThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig | null;
  onSelectTheme: (theme: ThemeConfig) => void;
}

const PRESET_COLORS = [
  'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
  '#0f172a', // slate-900
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
];

export default function ChatThemeModal({ isOpen, onClose, currentTheme, onSelectTheme }: ChatThemeModalProps) {
  const [uploadedThemes, setUploadedThemes] = useState<string[]>([]);

  useEffect(() => {
    // Load previously uploaded themes from localStorage
    const saved = localStorage.getItem('uploaded_chat_themes');
    if (saved) {
      try {
        setUploadedThemes(JSON.parse(saved));
      } catch (e) {}
    }
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newThemes = [base64, ...uploadedThemes].slice(0, 5); // Keep last 5
      setUploadedThemes(newThemes);
      localStorage.setItem('uploaded_chat_themes', JSON.stringify(newThemes));
      onSelectTheme({ type: 'image', value: base64 });
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tùy chỉnh giao diện</h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Colors / Gradients */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Màu sắc & Gradient</h3>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_COLORS.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectTheme({ type: 'color', value: color })}
                    className={`w-full aspect-square rounded-xl shadow-sm border-2 transition-transform hover:scale-105 ${currentTheme?.value === color ? 'border-blue-500' : 'border-transparent'}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preset Images */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Ảnh nền có sẵn</h3>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectTheme({ type: 'image', value: img })}
                    className={`w-full aspect-square rounded-xl shadow-sm border-2 overflow-hidden transition-transform hover:scale-105 ${currentTheme?.value === img ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <img src={img} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded Images */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Ảnh của bạn</h3>
              <div className="grid grid-cols-3 gap-3">
                <label className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <Upload size={24} className="text-gray-400 group-hover:text-blue-500 mb-2" />
                  <span className="text-xs text-gray-500 group-hover:text-blue-500 font-medium">Tải ảnh lên</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                {uploadedThemes.map((img, idx) => (
                  <button
                    key={`uploaded-${idx}`}
                    onClick={() => onSelectTheme({ type: 'image', value: img })}
                    className={`w-full aspect-square rounded-xl shadow-sm border-2 overflow-hidden transition-transform hover:scale-105 relative group ${currentTheme?.value === img ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <img src={img} alt="uploaded" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
