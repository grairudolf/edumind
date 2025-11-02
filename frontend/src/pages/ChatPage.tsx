import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import {
  Send,
  Mic,
  MicOff,
  Add,
  SmartToy,
  School,
} from '@mui/icons-material';
import { useChat } from '../contexts/ChatContext';
import LoadingSpinner from '../components/LoadingSpinner';

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

const ChatPage: React.FC = () => {
    const {
    currentSession,
    messages,
    isConnected,
    isTyping,
    sendMessage,
    createSession,
    endSession,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    title: '',
    subject: '',
    difficulty_level: 'beginner',
    language: 'en',
  });
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await sendMessage(newMessage, 'text', newSessionData.language);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionData.title.trim()) {
      alert('Please enter a session title.');
      return;
    }

    setIsLoading(true);
    try {
      await createSession(newSessionData);
      setShowNewSessionDialog(false);
      setNewSessionData({
        title: '',
        subject: '',
        difficulty_level: 'beginner',
        language: 'en',
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <Slide direction="down" in mountOnEnter unmountOnExit>
          <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                {currentSession ? currentSession.title : 'Chat with EduMind'}
              </Typography>
              {currentSession && (
                <Grow in timeout={500}>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip label={currentSession.subject || 'General'} size="small" icon={<School />} />
                    <Chip label={currentSession.difficulty_level} size="small" variant="outlined" />
                    <Chip label={currentSession.language.toUpperCase()} size="small" variant="outlined" />
                  </Box>
                </Grow>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {!currentSession && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowNewSessionDialog(true)}
                >
                  New Session
                </Button>
              )}

              {currentSession && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={endSession}
                >
                  End Session
                </Button>
              )}
            </Box>
          </Paper>
        </Slide>

        {/* Connection Status */}
        <Fade in={!isConnected}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Not connected to chat server. Messages may not be delivered in real-time.
          </Alert>
        </Fade>

        {/* Messages Area */}
        <Paper
          elevation={1}
          sx={{
            flex: 1,
            p: 2,
            mb: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.length === 0 && !currentSession && (
            <Fade in>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
              }}>
                <SmartToy sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Start a conversation with EduMind
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Ask questions about any subject and get personalized help!
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => setShowNewSessionDialog(true)}
                >
                  Start New Session
                </Button>
              </Box>
            </Fade>
          )}

          {messages.map((message: Message, index: number) => (
            <Slide key={message.id} direction={message.is_user ? 'left' : 'right'} in mountOnEnter>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.is_user ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Box
                  className={`chat-message ${message.is_user ? 'user' : 'bot'}`}
                  sx={{
                    maxWidth: '70%',
                    position: 'relative',
                    animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {!message.is_user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                        <SmartToy sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="caption" color="textSecondary">
                        EduMind
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1,
                  }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {message.sentiment && (
                        <Chip
                          label={message.sentiment}
                          size="small"
                          color={getSentimentColor(message.sentiment) as any}
                          variant="outlined"
                        />
                      )}
                      {message.response_time && !message.is_user && (
                        <Chip
                          label={`${message.response_time.toFixed(1)}s`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="caption" color="textSecondary">
                      {formatTime(message.created_at)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Slide>
          ))}

          {/* Typing Indicator */}
          <Fade in={isTyping}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box className="chat-message bot" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                  <SmartToy sx={{ fontSize: 16 }} />
                </Avatar>
                <Box className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </Box>
              </Box>
            </Box>
          </Fade>

          <div ref={messagesEndRef} />
        </Paper>

        {/* Message Input */}
        <Slide direction="up" in mountOnEnter unmountOnExit>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                disabled={isTyping || isLoading}
                sx={{ flex: 1 }}
              />

              <IconButton
                color={isListening ? 'error' : 'default'}
                onClick={handleVoiceInput}
                disabled={!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)}
                title={isListening ? 'Stop voice input' : 'Start voice input'}
              >
                {isListening ? <MicOff /> : <Mic />}
              </IconButton>

              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping || isLoading}
                endIcon={isLoading ? <LoadingSpinner size={16} /> : <Send />}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Supported: Text, Voice (click mic button)
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`Language: ${newSessionData.language.toUpperCase()}`}
                  size="small"
                  variant="outlined"
                  onClick={() => setShowNewSessionDialog(true)}
                />
                {currentSession && (
                  <Chip
                    label="Session Active"
                    size="small"
                    color="success"
                  />
                )}
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Box>

      {/* New Session Dialog */}
      <Dialog open={showNewSessionDialog} onClose={() => setShowNewSessionDialog(false)}>
        <DialogTitle>Start New Chat Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Title"
            fullWidth
            variant="outlined"
            value={newSessionData.title}
            onChange={(e) => setNewSessionData({ ...newSessionData, title: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={newSessionData.subject}
              label="Subject"
              onChange={(e) => setNewSessionData({ ...newSessionData, subject: e.target.value })}
            >
              <MenuItem value="">General</MenuItem>
              <MenuItem value="mathematics">Mathematics</MenuItem>
              <MenuItem value="physics">Physics</MenuItem>
              <MenuItem value="chemistry">Chemistry</MenuItem>
              <MenuItem value="biology">Biology</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty Level</InputLabel>
            <Select
              value={newSessionData.difficulty_level}
              label="Difficulty Level"
              onChange={(e) => setNewSessionData({ ...newSessionData, difficulty_level: e.target.value })}
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={newSessionData.language}
              label="Language"
              onChange={(e) => setNewSessionData({ ...newSessionData, language: e.target.value })}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="pidgin">Pidgin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewSessionDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateSession} variant="contained">
            Start Session
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChatPage;
