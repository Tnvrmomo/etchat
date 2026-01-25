/**
 * Call Code Generator - Google Meet Style
 * Generates unique, easy-to-remember call codes for joining calls
 */

export interface CallCode {
  code: string; // e.g., "abc-def-ghi"
  callId: string;
  createdAt: Date;
  expiresAt: Date;
  maxParticipants?: number;
  currentParticipants: number;
  isActive: boolean;
}

export interface CallSession {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  title: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  participants: string[];
  maxParticipants: number;
  isRecording: boolean;
  isScreenSharing: boolean;
  settings: {
    allowChat: boolean;
    allowScreenShare: boolean;
    allowReactions: boolean;
    allowHandRaise: boolean;
    requirePassword?: string;
  };
}

/**
 * Generate a unique call code in Google Meet format
 * Format: 3 groups of 3 random characters (abc-def-ghi)
 */
export const generateCallCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < 3; i++) {
    if (i > 0) code += '-';
    for (let j = 0; j < 3; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return code;
};

/**
 * Validate call code format
 */
export const isValidCallCode = (code: string): boolean => {
  const pattern = /^[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3}$/i;
  return pattern.test(code);
};

/**
 * Normalize call code (remove spaces, lowercase)
 */
export const normalizeCallCode = (code: string): string => {
  return code.trim().toLowerCase().replace(/\s/g, '');
};

/**
 * Format call code for display (add hyphens if needed)
 */
export const formatCallCode = (code: string): string => {
  const normalized = normalizeCallCode(code);

  if (normalized.length !== 9) return normalized;

  return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
};

/**
 * Generate a unique call session
 */
export const createCallSession = (
  hostId: string,
  hostName: string,
  title: string = 'Unnamed Call',
): CallSession => {
  const code = generateCallCode();

  return {
    id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code,
    hostId,
    hostName,
    title,
    createdAt: new Date(),
    participants: [hostId],
    maxParticipants: 100,
    isRecording: false,
    isScreenSharing: false,
    settings: {
      allowChat: true,
      allowScreenShare: true,
      allowReactions: true,
      allowHandRaise: true,
    },
  };
};

/**
 * Call Code Manager for managing multiple active calls
 */
export class CallCodeManager {
  private calls: Map<string, CallSession> = new Map();
  private codeMap: Map<string, string> = new Map(); // code -> callId mapping

  createCall(hostId: string, hostName: string, title?: string): CallSession {
    const session = createCallSession(hostId, hostName, title);
    this.calls.set(session.id, session);
    this.codeMap.set(session.code, session.id);
    return session;
  }

  getCallByCode(code: string): CallSession | null {
    const callId = this.codeMap.get(normalizeCallCode(code));
    return callId ? this.calls.get(callId) ?? null : null;
  }

  getCallById(callId: string): CallSession | null {
    return this.calls.get(callId) ?? null;
  }

  addParticipant(callId: string, participantId: string): boolean {
    const session = this.calls.get(callId);
    if (!session) return false;

    if (!session.startedAt) {
      session.startedAt = new Date();
    }

    if (!session.participants.includes(participantId)) {
      session.participants.push(participantId);
    }

    return true;
  }

  removeParticipant(callId: string, participantId: string): boolean {
    const session = this.calls.get(callId);
    if (!session) return false;

    session.participants = session.participants.filter((id) => id !== participantId);

    // End call if no participants left
    if (session.participants.length === 0) {
      this.endCall(callId);
    }

    return true;
  }

  endCall(callId: string): boolean {
    const session = this.calls.get(callId);
    if (!session) return false;

    session.endedAt = new Date();
    return true;
  }

  getActiveCall(callId: string): CallSession | null {
    const session = this.calls.get(callId);
    return session && !session.endedAt ? session : null;
  }

  getAllActiveCalls(): CallSession[] {
    return Array.from(this.calls.values()).filter((call) => !call.endedAt);
  }

  deleteCall(callId: string): boolean {
    const session = this.calls.get(callId);
    if (!session) return false;

    this.codeMap.delete(session.code);
    this.calls.delete(callId);
    return true;
  }
}

/**
 * Global call manager instance
 */
export const globalCallManager = new CallCodeManager();
