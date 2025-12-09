import { useState } from 'react';
import { MessageCircle, Users, Palette, Layers } from 'lucide-react';
import { ReelsView } from './ReelsView';
import { ThreadsView } from './ThreadsView';
import { CanvasView } from './CanvasView';

type HomeTab = 'reels' | 'threads' | 'canvases';

const tabs: { id: HomeTab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'reels', label: 'Water Cooler', icon: <MessageCircle className="w-4 h-4" />, description: 'Quick chats' },
  { id: 'threads', label: 'Discussions', icon: <Users className="w-4 h-4" />, description: 'Deep dives' },
  { id: 'canvases', label: 'Canvases', icon: <Palette className="w-4 h-4" />, description: 'Build together' },
];

export const HomeView = () => {
  const [activeTab, setActiveTab] = useState<HomeTab>('reels');

  return (
    <div className="min-h-screen">
      {/* Tab navigation */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-organic
                  font-display text-sm transition-all
                  ${activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-soft' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in-up">
        {activeTab === 'reels' && <ReelsView />}
        {activeTab === 'threads' && <ThreadsView />}
        {activeTab === 'canvases' && <CanvasView />}
      </div>
    </div>
  );
};
