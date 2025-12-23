import { useState } from 'react';
import { FileText, Image, Video, Music, File, Download, Trash2, Search, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSharedFiles, SharedFile } from '@/hooks/useSharedFiles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const FilesView = () => {
  const { user } = useAuth();
  const { files, isLoading, uploadFile, deleteFile, downloadFile } = useSharedFiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | SharedFile['file_type']>('all');
  const [isUploading, setIsUploading] = useState(false);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || file.file_type === filter;
    return matchesSearch && matchesFilter;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getFileIcon = (type: SharedFile['file_type']) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-accent" />;
      case 'video': return <Video className="w-5 h-5 text-destructive" />;
      case 'audio': return <Music className="w-5 h-5 text-secondary" />;
      case 'document': return <FileText className="w-5 h-5 text-primary" />;
      default: return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const filters: { id: 'all' | SharedFile['file_type']; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
    { id: 'document', label: 'Docs' },
    { id: 'audio', label: 'Audio' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max size is 50MB`);
          continue;
        }
        await uploadFile(file);
      }
      toast.success('Files uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload some files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (file: SharedFile) => {
    if (file.uploaded_by !== user?.id) {
      toast.error('You can only delete your own files');
      return;
    }
    
    await deleteFile(file.id, file.storage_path);
    toast.success('File deleted');
  };

  const handleDownload = (file: SharedFile) => {
    downloadFile(file.public_url, file.name);
  };

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
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
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
                {/* File icon or preview */}
                <div className="w-12 h-12 rounded-organic bg-muted flex items-center justify-center overflow-hidden">
                  {file.file_type === 'image' ? (
                    <img 
                      src={file.public_url} 
                      alt={file.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getFileIcon(file.file_type)
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatSize(file.size)}</span>
                    {file.conversation_name && (
                      <>
                        <span>•</span>
                        <span className="truncate">{file.conversation_name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatTime(file.created_at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">by {file.uploader_name}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  {file.uploaded_by === user?.id && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload FAB */}
      <div className="fixed bottom-24 right-4">
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <label htmlFor="file-upload">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-warm"
            disabled={isUploading}
            asChild
          >
            <span>
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};
