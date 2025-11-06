import { ReactNode, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface FullscreenWrapperProps {
  children: ReactNode;
  title?: string;
}

export function FullscreenWrapper({ children, title }: FullscreenWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 overflow-auto">
        <div className="min-h-screen p-6">
          <div className="mb-4 flex items-center justify-between">
            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 flex items-center gap-2"
              title="Exit fullscreen (Esc)"
            >
              <Minimize2 size={18} />
              Exit Fullscreen
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 z-10 p-2 bg-white border-2 border-[#24a4ab] rounded-lg shadow-lg hover:bg-[#24a4ab] hover:text-white transition-all"
        title="Click to fullscreen"
      >
        <Maximize2 size={18} className="text-[#24a4ab] hover:text-white" strokeWidth={2.5} />
      </button>
      {children}
    </div>
  );
}
