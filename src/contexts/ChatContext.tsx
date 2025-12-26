/**
 * Chat Context - Unified Chat State Management
 * Persists all conversations to Firestore for RAG training and user personalization
 * 
 * Schema: chat_sessions/{userId}/messages/{messageId}
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
  where,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '../../lib/gcp';
import { sendToGemini } from '../../lib/ai/gemini';

// ==========================================
// TYPES
// ==========================================

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date | Timestamp;
  
  // RAG Training Metadata
  industry?: string;
  intent?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
  
  // UI State
  isStreaming?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  industry: string;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  summary?: string;
}

export interface ChatContextState {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  currentSessionId: string | null;
  currentIndustry: string | null;
  user: User | null;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  openChat: (industry?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
  loadSession: (sessionId: string) => Promise<void>;
  
  // Voice
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

// ==========================================
// CONTEXT
// ==========================================

const ChatContext = createContext<ChatContextState | null>(null);

// ==========================================
// PROVIDER
// ==========================================

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentIndustry, setCurrentIndustry] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isListening, setIsListening] = useState(false);

  // ==========================================
  // AUTH LISTENER
  // ==========================================

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // MESSAGE PERSISTENCE
  // ==========================================

  const persistMessage = useCallback(async (message: ChatMessage): Promise<string | null> => {
    if (!user) {
      console.log('No user, skipping message persistence');
      return null;
    }

    try {
      const messagesRef = collection(db, `chat_sessions/${user.uid}/messages`);
      const docRef = await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp(),
        sessionId: currentSessionId,
        industry: currentIndustry,
      });
      return docRef.id;
    } catch (error) {
      console.error('Failed to persist message:', error);
      return null;
    }
  }, [user, currentSessionId, currentIndustry]);

  // ==========================================
  // LOAD SESSION
  // ==========================================

  const loadSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const messagesRef = collection(db, `chat_sessions/${user.uid}/messages`);
      const q = query(
        messagesRef,
        where('sessionId', '==', sessionId),
        orderBy('timestamp', 'asc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const loadedMessages: ChatMessage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];

      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }, [user]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Create user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      industry: currentIndustry || undefined,
    };

    // Add to local state immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Persist user message
    await persistMessage(userMessage);

    try {
      // Build context from recent messages for Gemini
      const geminiMessages = [...messages.slice(-10), userMessage].map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      // Build context string based on industry
      const contextString = currentIndustry
        ? `Industry focus: ${currentIndustry}. Provide expert, actionable advice for this industry.`
        : undefined;

      // Send to Gemini - correct function signature: (messages, context?)
      const response = await sendToGemini(geminiMessages, contextString);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        industry: currentIndustry || undefined,
      };

      // Add to local state
      setMessages(prev => [...prev, assistantMessage]);

      // Persist assistant message
      await persistMessage(assistantMessage);

    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        error: error.message,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, currentIndustry, persistMessage]);

  // ==========================================
  // CHAT CONTROLS
  // ==========================================

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
  }, []);

  const openChat = useCallback((industry?: string) => {
    if (industry) {
      setCurrentIndustry(industry);
    }
    setIsOpen(true);
    
    // Create new session ID
    setCurrentSessionId(`session_${Date.now()}`);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isOpen, openChat, closeChat]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value: ChatContextState = {
    messages,
    isLoading,
    isOpen,
    currentSessionId,
    currentIndustry,
    user,
    sendMessage,
    clearMessages,
    openChat,
    closeChat,
    toggleChat,
    loadSession,
    isListening,
    setIsListening,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

export function useChat(): ChatContextState {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Extract keywords from message for RAG
 */
export function extractKeywords(text: string): string[] {
  // Simple keyword extraction (can be enhanced with NLP)
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although', 'though', 'after', 'before', 'when', 'whenever', 'where', 'wherever', 'whether', 'which', 'while', 'who', 'whoever', 'whom', 'whose', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what']);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 10);
}

/**
 * Analyze sentiment (basic implementation)
 */
export function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['great', 'good', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'happy', 'thank', 'thanks', 'helpful', 'perfect', 'awesome'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'frustrated', 'disappointed', 'wrong', 'error', 'problem', 'issue', 'fail', 'broken'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score--;
  });
  
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

export default ChatContext;
