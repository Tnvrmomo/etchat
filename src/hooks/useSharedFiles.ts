import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SharedFile {
  id: string;
  name: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  storage_path: string;
  public_url: string;
  conversation_id: string | null;
  message_id: string | null;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
  conversation_name?: string;
}

export const useSharedFiles = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFileTypeCategory = (mimeType: string): SharedFile['file_type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('sheet')) return 'document';
    return 'other';
  };

  const fetchFiles = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('shared_files')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching files:', error);
        return;
      }

      // Fetch uploader profiles and conversation names
      const filesWithDetails = await Promise.all(
        (data || []).map(async (file) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', file.uploaded_by)
            .single();

          let conversationName = '';
          if (file.conversation_id) {
            const { data: conv } = await supabase
              .from('conversations')
              .select('name, type')
              .eq('id', file.conversation_id)
              .single();
            
            if (conv) {
              if (conv.type === 'direct') {
                // Get other participant name
                const { data: participants } = await supabase
                  .from('conversation_participants')
                  .select('user_id')
                  .eq('conversation_id', file.conversation_id)
                  .neq('user_id', user.id)
                  .limit(1);
                
                if (participants && participants.length > 0) {
                  const { data: otherProfile } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('user_id', participants[0].user_id)
                    .single();
                  conversationName = otherProfile?.display_name || 'Direct Message';
                }
              } else {
                conversationName = conv.name || 'Group Chat';
              }
            }
          }

          return {
            ...file,
            file_type: getFileTypeCategory(file.file_type),
            uploader_name: file.uploaded_by === user.id ? 'You' : (profile?.display_name || 'Unknown'),
            conversation_name: conversationName,
          };
        })
      );

      setFiles(filesWithDetails);
    } catch (err) {
      console.error('Error in fetchFiles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('shared-files-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_files',
        },
        () => {
          fetchFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFiles]);

  const uploadFile = async (
    file: File,
    conversationId?: string,
    messageId?: string
  ): Promise<SharedFile | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${conversationId || 'general'}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(data.path);

      const { data: fileRecord, error: insertError } = await supabase
        .from('shared_files')
        .insert({
          name: file.name,
          file_type: file.type,
          size: file.size,
          storage_path: data.path,
          public_url: urlData.publicUrl,
          conversation_id: conversationId || null,
          message_id: messageId || null,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        ...fileRecord,
        file_type: getFileTypeCategory(file.type),
        uploader_name: 'You',
      };
    } catch (err) {
      console.error('Error uploading file:', err);
      return null;
    }
  };

  const deleteFile = async (fileId: string, storagePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from('chat-attachments').remove([storagePath]);

      // Delete from database
      await supabase.from('shared_files').delete().eq('id', fileId);

      await fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const downloadFile = async (publicUrl: string, fileName: string) => {
    try {
      const response = await fetch(publicUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  return {
    files,
    isLoading,
    refresh: fetchFiles,
    uploadFile,
    deleteFile,
    downloadFile,
  };
};
