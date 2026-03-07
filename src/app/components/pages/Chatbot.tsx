import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Dynamic answers fetched via backend API

const suggestedQueries = [
  "Why is inverter 4 failing?",
  "Show anomalies in PV voltage",
  "Which inverter will fail next?",
  "Summarize today's performance",
  "What's the overall system health?",
  "Explain the risk factors",
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI assistant for solar plant monitoring. I can help you analyze inverter health, predict failures, explain system anomalies, and answer questions about your solar plant operations. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
      // Map history for the backend (excluding the current user message being sent to avoid repetition, if we only send current query separate from history context)
      // Actually, passing the whole history including current works if backend handles it, but let's pass all past messages as history and current input as query
      const historyMsg = messages.map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, history: historyMsg }),
      });

      if (!res.ok) throw new Error('Failed to communicate with chat API');
      
      const data = await res.json();
      
      const aiMessage: Message = {
        id: newMessages.length + 2,
        type: 'ai',
        content: data.reply || "I didn't understand that.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: newMessages.length + 2,
        type: 'ai',
        content: 'Sorry, I am having trouble connecting to the AI backend right now.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
  };

  return (
    <div className="h-[calc(100vh-100px)]">
      {/* Chatbot Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1D29] rounded-xl border border-gray-800 overflow-hidden h-full flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFC107] to-[#FF9800] p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">SolarAI Assistant</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse" />
              <p className="text-sm text-white/90">Always Online</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Suggested Queries */}
          {messages.length === 1 && (
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Try asking:</p>
              <div className="grid grid-cols-2 gap-3">
                {suggestedQueries.map((query, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSuggestedQuery(query)}
                    className="text-left text-sm px-4 py-3 bg-[#0E1117] hover:bg-[#FFC107]/20 border border-gray-800 hover:border-[#FFC107]/50 rounded-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4 inline mr-2 text-[#FFC107]" />
                    {query}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-4 ${message.type === 'user'
                    ? 'bg-gradient-to-r from-[#FFC107] to-[#FF9800] text-[#0E1117]'
                    : 'bg-[#0E1117] text-white border border-gray-800'
                  }`}
              >
                <div className={`text-sm leading-relaxed mb-2 prose prose-invert max-w-none ${message.type === 'user' ? 'prose-p:text-[#0E1117] prose-strong:text-[#0E1117]' : 'prose-p:text-gray-300'} prose-ul:my-1 prose-li:my-0`}>
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
                <p
                  className={`text-xs ${message.type === 'user' ? 'text-[#0E1117]/60' : 'text-gray-500'
                    }`}
                >
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
              <div className="bg-[#0E1117] border border-gray-800 rounded-2xl px-5 py-4 max-w-[70%]">
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

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-[#0E1117]">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your solar plant..."
              className="flex-1 px-4 py-3 bg-[#1A1D29] border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-[#FFC107] transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#FFC107] to-[#FF9800] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#FFC107]/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-[#0E1117]" />
              <span className="font-medium text-[#0E1117]">Send</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
