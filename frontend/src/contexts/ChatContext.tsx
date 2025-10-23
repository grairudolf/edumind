import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  content: string;
  message_type: string;
  is_user: boolean;
  sentiment?: string;
  confidence?: number;
  language: string;
  response_time?: number;
  created_at: string;
}

interface ChatSession {
  id: number;
  title: string;
  subject?: string;
  difficulty_level: string;
  language: string;
  is_active: boolean;
  started_at: string;
  ended_at?: string;
  messages: Message[];
}

interface ChatContextType {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  sendMessage: (message: string, type?: string, language?: string) => Promise<void>;
  createSession: (sessionData: Partial<ChatSession>) => Promise<void>;
  loadSession: (sessionId: number) => Promise<void>;
  endSession: () => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const newSocket = io('http://localhost:8000', {
        auth: {
          token: token,
        },
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('chat_response', (data: any) => {
        handleChatResponse(data);
      });

      newSocket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  const handleChatResponse = (data: any) => {
    setIsTyping(false);

    const botMessage: Message = {
      id: Date.now() + Math.random(),
      content: data.data.response,
      message_type: 'text',
      is_user: false,
      sentiment: data.data.sentiment,
      confidence: data.data.confidence,
      language: data.data.language,
      response_time: data.data.response_time,
      created_at: data.data.timestamp,
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const sendMessage = async (message: string, type: string = 'text', language: string = 'en') => {
    if (!message.trim()) return;

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now(),
      content: message,
      message_type: type,
      is_user: true,
      language: language,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Send via socket or API
    if (socket && isConnected) {
      socket.emit('chat_message', {
        message: message,
        type: type,
        language: language,
        session_id: currentSession?.id,
      });
    } else {
      // Fallback to REST API
      try {
        await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            message: message,
            type: type,
            language: language,
            session_id: currentSession?.id,
          }),
        });
      } catch (error) {
        console.error('Error sending message:', error);
        setIsTyping(false);
      }
    }
  };

  const createSession = async (sessionData: Partial<ChatSession>) => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        const newSession = await response.json();
        setCurrentSession({
          ...newSession,
          messages: [],
        });
        setMessages([]);
        await loadSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadSession = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const sessionData = await response.json();
        setCurrentSession(sessionData);
        setMessages(sessionData.messages);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;

    try {
      await fetch(`/api/chat/sessions/${currentSession.id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setCurrentSession(null);
      setMessages([]);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const sessionsData = await response.json();
        setSessions(sessionsData);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const value: ChatContextType = {
    currentSession,
    sessions,
    messages,
    isConnected,
    isTyping,
    sendMessage,
    createSession,
    loadSession,
    endSession,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
