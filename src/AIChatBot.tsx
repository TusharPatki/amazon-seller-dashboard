import React, { useState, useRef, useEffect } from 'react';
import { getPerplexityResponse } from './services/perplexityService';

interface Order {
  orderDate: string;
  productName: string;
  quantity: number;
  price: number;
  status: string;
}

interface InventoryItem {
  asin: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
}

interface AIChatBotProps {
  orders: Order[];
  inventory: InventoryItem[];
}

export function AIChatBot({ orders, inventory }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your Amazon Seller Assistant powered by Perplexity AI. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check API key on component mount
  useEffect(() => {
    const apiKey = process.env.REACT_APP_PERPLEXITY_API_KEY?.trim();
    if (!apiKey) {
      console.error('Perplexity API key not found in environment variables');
      setMessages(prev => [...prev, {
        text: "Configuration Error: The AI service is not properly configured. Please check your environment variables and restart the application.",
        isUser: false,
        timestamp: new Date(),
        isError: true
      }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedQuestions = [
    "What are my top selling products?",
    "How many items are low in stock?",
    "What's my total revenue this week?",
    "Show me cancelled orders analysis",
    "Analyze my inventory turnover",
    "What are the sales trends?"
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const apiKey = process.env.REACT_APP_PERPLEXITY_API_KEY?.trim();
    if (!apiKey) {
      setMessages(prev => [...prev, {
        text: "Configuration Error: The AI service is not properly configured. Please check your environment variables and restart the application.",
        isUser: false,
        timestamp: new Date(),
        isError: true
      }]);
      return;
    }

    // Add user message
    const userMessage: Message = {
      text: text,
      isUser: true,
      timestamp: new Date()
    };

    // Add loading message
    const loadingMessage: Message = {
      text: "Thinking...",
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);
    setInputValue('');

    try {
      // Get AI response
      const response = await getPerplexityResponse(text, orders, inventory);

      // Replace loading message with actual response
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove loading message
        {
          text: response,
          isUser: false,
          timestamp: new Date(),
          isError: response.toLowerCase().includes('error') || response.toLowerCase().includes('configuration')
        }
      ]);
    } catch (error) {
      console.error('Error in chat:', error);
      // Replace loading message with error message
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove loading message
        {
          text: error instanceof Error 
            ? `Error: ${error.message}. Please try again or contact support.`
            : "An unexpected error occurred. Please try again later.",
          isUser: false,
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>Ask AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 max-w-full flex flex-col" style={{ height: '500px' }}>
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-blue-500 text-white rounded-t-lg">
            <h3 className="font-medium">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3/4 p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : message.isLoading
                      ? 'bg-gray-100 text-gray-500 animate-pulse'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {message.text}
                    </pre>
                  )}
                  <div className={`text-xs mt-1 ${
                    message.isUser 
                      ? 'text-blue-100' 
                      : message.isError
                      ? 'text-red-500'
                      : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">Suggested questions:</div>
            <div className="flex flex-wrap gap-2">
              {predefinedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  disabled={isLoading}
                  className={`text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-100 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage(inputValue)}
                placeholder="Type your question..."
                disabled={isLoading}
                className={`flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading}
                className={`bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 