import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const suggestedQueries = [
  "How many plants are there?",
  "List all plants",
  "How many inverters are in plant1_1?",
  "What is the failure risk for inverter 2 in plant1_1?",
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI assistant. I can help you analyze inverter health, predict failures, and explain system anomalies. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const historyMsg = messages.map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, history: historyMsg, session_id: sessionId }),
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();

      // Persist session_id from backend for context tracking
      if (data.session_id) {
        setSessionId(data.session_id);
      }
      
      const aiMessage: Message = {
        id: newMessages.length + 2,
        type: 'ai',
        content: data.reply || "I didn't understand that.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: newMessages.length + 2,
        type: 'ai',
        content: 'Error connecting to the AI backend.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
  };

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-full shadow-2xl flex items-center justify-center z-50"
          >
            <MessageSquare className="w-7 h-7 text-[#0E1117]" />
            <motion.div
              className="absolute inset-0 rounded-full bg-[#FFC107]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#1A1D29] border border-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FFC107] to-[#FF9800] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI Assistant</h3>
                  <p className="text-xs text-white/80">Always Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Suggested Queries */}
            {messages.length === 1 && (
              <div className="p-4 bg-[#0E1117] border-b border-gray-800">
                <p className="text-xs text-gray-400 mb-2">Suggested queries:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuery(query)}
                      className="text-xs px-3 py-1.5 bg-[#1A1D29] hover:bg-[#FFC107]/20 border border-gray-800 hover:border-[#FFC107]/50 rounded-full transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-[#FFC107] to-[#FF9800] text-[#0E1117]'
                        : 'bg-[#0E1117] text-white border border-gray-800'
                    }`}
                  >
                    <div className={`text-sm leading-relaxed mb-1 prose prose-invert max-w-none ${message.type === 'user' ? 'prose-p:text-[#0E1117] prose-strong:text-[#0E1117]' : 'prose-p:text-gray-300'} prose-ul:my-1 prose-li:my-0`}>
                      <ReactMarkdown 
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold bg-white/10 px-1 rounded-sm" {...props} />
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <p className={`text-[10px] mt-1 ${
                      message.type === 'user' ? 'text-[#0E1117]/60' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#0E1117] border border-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gray-500 rounded-full"
                          animate={{
                            y: [0, -8, 0],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 bg-[#0E1117] border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-[#FFC107] transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#FFC107] to-[#FF9800] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:shadow-lg hover:shadow-[#FFC107]/20"
                >
                  <Send className="w-4 h-4 text-[#0E1117]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
