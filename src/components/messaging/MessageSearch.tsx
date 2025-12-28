import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  senderName?: string;
}

interface MessageSearchProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
  onResultClick: (messageId: string) => void;
  members?: Array<{ id: string; name: string }>;
}

export const MessageSearch = ({
  conversationId,
  isOpen,
  onClose,
  onResultClick,
  members = [],
}: MessageSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const searchMessages = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at')
        .eq('conversation_id', conversationId)
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      const resultsWithNames = (data || []).map(msg => ({
        ...msg,
        senderName: members.find(m => m.id === msg.sender_id)?.name || 'Unknown',
      }));

      setResults(resultsWithNames);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, members]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMessages(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchMessages]);

  const handleNavigate = (direction: 'up' | 'down') => {
    if (results.length === 0) return;
    
    if (direction === 'up') {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
      setCurrentIndex(newIndex);
      onResultClick(results[newIndex].id);
    } else {
      const newIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
      onResultClick(results[newIndex].id);
    }
  };

  const handleResultClick = (result: SearchResult, index: number) => {
    setCurrentIndex(index);
    onResultClick(result.id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="border-b border-border bg-card animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2 p-2">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in conversation..."
          className="flex-1 h-9 border-0 focus-visible:ring-0 bg-transparent"
          autoFocus
        />
        
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        
        {results.length > 0 && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentIndex + 1} of {results.length}
          </span>
        )}
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleNavigate('up')}
            disabled={results.length === 0}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleNavigate('down')}
            disabled={results.length === 0}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Results dropdown */}
      {results.length > 0 && query.trim() && (
        <ScrollArea className="max-h-60 border-t border-border">
          <div className="p-1">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result, index)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md transition-colors',
                  currentIndex === index ? 'bg-primary/10' : 'hover:bg-muted'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">{result.senderName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(result.created_at)}</span>
                </div>
                <p className="text-sm text-foreground truncate mt-0.5">
                  {highlightMatch(result.content || '', query)}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {query.trim().length >= 2 && results.length === 0 && !isLoading && (
        <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
          No messages found
        </div>
      )}
    </div>
  );
};
