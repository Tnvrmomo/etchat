// IndexedDB-based offline storage for messages, calls, and profiles

const DB_NAME = 'et-chat-offline';
const DB_VERSION = 1;

interface OfflineMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  synced: boolean;
  attachments?: string;
}

interface OfflineCall {
  id: string;
  callerId: string;
  calleeId: string;
  callType: 'voice' | 'video';
  status: string;
  timestamp: string;
  synced: boolean;
}

interface OfflineProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  status: string;
  lastUpdated: string;
}

let db: IDBDatabase | null = null;

// Initialize IndexedDB
export const initOfflineStorage = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open offline database'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Messages store
      if (!database.objectStoreNames.contains('messages')) {
        const messagesStore = database.createObjectStore('messages', { keyPath: 'id' });
        messagesStore.createIndex('conversationId', 'conversationId', { unique: false });
        messagesStore.createIndex('synced', 'synced', { unique: false });
        messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Calls store
      if (!database.objectStoreNames.contains('calls')) {
        const callsStore = database.createObjectStore('calls', { keyPath: 'id' });
        callsStore.createIndex('synced', 'synced', { unique: false });
        callsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Profiles store
      if (!database.objectStoreNames.contains('profiles')) {
        const profilesStore = database.createObjectStore('profiles', { keyPath: 'id' });
        profilesStore.createIndex('userId', 'userId', { unique: true });
      }

      // Pending sync queue
      if (!database.objectStoreNames.contains('syncQueue')) {
        const syncStore = database.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Conversations cache
      if (!database.objectStoreNames.contains('conversations')) {
        const convStore = database.createObjectStore('conversations', { keyPath: 'id' });
        convStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
};

// Generic add function
const addToStore = async <T extends { id?: string }>(storeName: string, data: T): Promise<string> => {
  const database = await initOfflineStorage();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const id = data.id || crypto.randomUUID();
    const request = store.put({ ...data, id });
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(new Error(`Failed to add to ${storeName}`));
  });
};

// Generic get function
const getFromStore = async <T>(storeName: string, id: string): Promise<T | null> => {
  const database = await initOfflineStorage();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error(`Failed to get from ${storeName}`));
  });
};

// Generic get all function
const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  const database = await initOfflineStorage();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error(`Failed to get all from ${storeName}`));
  });
};

// Get by index
const getByIndex = async <T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> => {
  const database = await initOfflineStorage();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error(`Failed to query ${storeName} by ${indexName}`));
  });
};

// Delete from store
const deleteFromStore = async (storeName: string, id: string): Promise<void> => {
  const database = await initOfflineStorage();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to delete from ${storeName}`));
  });
};

// Message operations
export const saveOfflineMessage = async (message: OfflineMessage): Promise<string> => {
  return addToStore('messages', message);
};

export const getOfflineMessages = async (conversationId: string): Promise<OfflineMessage[]> => {
  return getByIndex('messages', 'conversationId', conversationId);
};

export const getUnsyncedMessages = async (): Promise<OfflineMessage[]> => {
  const all = await getAllFromStore<OfflineMessage>('messages');
  return all.filter(m => !m.synced);
};

export const markMessageSynced = async (id: string): Promise<void> => {
  const message = await getFromStore<OfflineMessage>('messages', id);
  if (message) {
    await addToStore('messages', { ...message, synced: true });
  }
};

// Call operations
export const saveOfflineCall = async (call: OfflineCall): Promise<string> => {
  return addToStore('calls', call);
};

export const getOfflineCalls = async (): Promise<OfflineCall[]> => {
  return getAllFromStore('calls');
};

export const getUnsyncedCalls = async (): Promise<OfflineCall[]> => {
  const all = await getAllFromStore<OfflineCall>('calls');
  return all.filter(c => !c.synced);
};

// Profile operations
export const saveOfflineProfile = async (profile: OfflineProfile): Promise<string> => {
  return addToStore('profiles', profile);
};

export const getOfflineProfile = async (userId: string): Promise<OfflineProfile | null> => {
  const profiles = await getByIndex<OfflineProfile>('profiles', 'userId', userId);
  return profiles[0] || null;
};

export const getAllOfflineProfiles = async (): Promise<OfflineProfile[]> => {
  return getAllFromStore('profiles');
};

// Sync queue operations
interface SyncQueueItem {
  id?: string;
  type: 'message' | 'call' | 'profile';
  action: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: string;
}

export const addToSyncQueue = async (item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<void> => {
  const newItem: SyncQueueItem = { 
    ...item, 
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString() 
  };
  await addToStore('syncQueue', newItem);
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  return getAllFromStore('syncQueue');
};

export const clearSyncQueue = async (): Promise<void> => {
  const items = await getSyncQueue();
  for (const item of items) {
    if (item.id) {
      await deleteFromStore('syncQueue', String(item.id));
    }
  }
};

// Conversation cache
export const cacheConversation = async (conversation: unknown): Promise<void> => {
  await addToStore('conversations', conversation);
};

export const getCachedConversations = async (): Promise<unknown[]> => {
  return getAllFromStore('conversations');
};

// Check storage quota
export const getStorageUsage = async (): Promise<{ used: number; quota: number }> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return { used: 0, quota: 0 };
};

// Clear all offline data
export const clearOfflineStorage = async (): Promise<void> => {
  const database = await initOfflineStorage();
  const storeNames = ['messages', 'calls', 'profiles', 'syncQueue', 'conversations'];
  
  for (const storeName of storeNames) {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.clear();
  }
};
