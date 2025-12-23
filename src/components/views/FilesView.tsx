import { useState } from 'react';
import { FileText, Image, Video, Music, File, Download, Trash2, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SharedFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  sharedBy: string;
  sharedIn: string;
  timestamp: Date;
  url: string;
}

const demoFiles: SharedFile[] = [
  { id: '1', name: 'Project_Proposal.pdf', type: 'document', size: 2400000, sharedBy: 'Alex Chen', sharedIn: 'Team Chat', timestamp: new Date(Date.now() - 1000 * 60 * 60), url: '#' },
  { id: '2', name: 'meeting_screenshot.png', type: 'image', size: 850000, sharedBy: 'Sarah Wilson', sharedIn: 'Marketing Group', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), url: '#' },
  { id: '3', name: 'presentation.mp4', type: 'video', size: 15000000, sharedBy: 'Jordan Lee', sharedIn: 'Team Chat', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), url: '#' },
  { id: '4', name: 'voice_memo.mp3', type: 'audio', size: 320000, sharedBy: 'You', sharedIn: 'Alex Chen', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), url: '#' },
  { id: '5', name: 'design_assets.zip', type: 'other', size: 45000000, sharedBy: 'Sarah Wilson', sharedIn: 'Design Team', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), url: '#' },
];

export const FilesView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | SharedFile['type']>('all');

  const filteredFiles = demoFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || file.type === filter;
    return matchesSearch && matchesFilter;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getFileIcon = (type: SharedFile['type']) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-accent" />;
      case 'video': return <Video className="w-5 h-5 text-destructive" />;
      case 'audio': return <Music className="w-5 h-5 text-secondary" />;
      case 'document': return <FileText className="w-5 h-5 text-primary" />;
      default: return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const filters: { id: 'all' | SharedFile['type']; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
    { id: 'document', label: 'Docs' },
    { id: 'audio', label: 'Audio' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 bg-card border-b border-border space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.id)}
              className="font-display whitespace-nowrap"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Files list */}
      <div className="flex-1 overflow-auto">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-display">No files found</p>
            <p className="text-sm">Shared files will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors"
              >
                {/* File icon */}
                <div className="w-12 h-12 rounded-organic bg-muted flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.sharedIn}</span>
                    <span>•</span>
                    <span>{formatTime(file.timestamp)}</span>
                  </div>
                </div>

                {/* Actions */}
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload FAB */}
      <div className="fixed bottom-24 right-4">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-warm"
        >
          <Upload className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};
