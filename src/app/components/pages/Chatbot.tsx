import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, Bot } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const sampleResponses = [
  "Based on the current data, Inverter 4 shows the highest failure risk at 82% due to elevated internal temperatures (avg 67°C) and unstable PV voltage patterns.",
  "I've detected voltage anomalies in Inverters 3 and 7. Both show voltage fluctuations exceeding normal operating thresholds by 15%.",
  "According to my predictive model, Inverter 2 is most likely to fail next, with a predicted failure window of 3-5 days. The key factors are rising temperature trends and decreasing efficiency.",
  "The temperature spike you're seeing is within acceptable parameters, but I recommend monitoring it closely. I'll alert you if it exceeds critical thresholds.",
  "Today's performance summary: 8.4 MWh generated, 99.4% uptime, 2 warning alerts, 1 critical alert. Overall system efficiency at 95.8%.",
  "Inverter 6 is performing excellently with 99% power output and the lowest risk score at 12%. It's our best-performing unit.",
];

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

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: sampleResponses[Math.floor(Math.random() * sampleResponses.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">AI Chatbot Assistant</h1>
        <p className="text-gray-400">Ask questions and get intelligent insights about your solar plant</p>
      </motion.div>

      {/* Chatbot Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1D29] rounded-xl border border-gray-800 overflow-hidden"
        style={{ height: 'calc(100vh - 280px)' }}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ height: 'calc(100% - 200px)' }}>
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
                className={`max-w-[70%] rounded-2xl px-5 py-4 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-[#FFC107] to-[#FF9800] text-[#0E1117]'
                    : 'bg-[#0E1117] text-white border border-gray-800'
                }`}
              >
                <p className="text-sm leading-relaxed mb-2">{message.content}</p>
                <p
                  className={`text-xs ${
                    message.type === 'user' ? 'text-[#0E1117]/60' : 'text-gray-500'
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
