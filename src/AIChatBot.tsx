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
      text: "Hello! I'm your Amazon Seller Assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Define all possible suggestions
  const allSuggestions = [
    "What are my top selling products?",
    "How many items are low in stock?",
    "What's my total revenue this week?",
    "Show me cancelled orders analysis",
    "Analyze my inventory turnover",
    "What are the sales trends?",
    "Compare this month vs last month",
    "Which products have the highest profit margin?",
    "Forecast my inventory needs",
    "Identify slow-moving inventory"
  ];

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }
    
    const filtered = allSuggestions.filter(
      suggestion => suggestion.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 3); // Only show top 3 matches
    
    setFilteredSuggestions(filtered);
    setActiveSuggestion(-1);
  }, [inputValue]);
  
  // Handle arrow key navigation through suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If no suggestions, do nothing
    if (filteredSuggestions.length === 0) return;
    
    // Up arrow
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prevActive => 
        prevActive > 0 ? prevActive - 1 : filteredSuggestions.length - 1
      );
    }
    // Down arrow
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prevActive => 
        prevActive < filteredSuggestions.length - 1 ? prevActive + 1 : 0
      );
    }
    // Tab or Enter to select suggestion
    else if ((e.key === 'Tab' || e.key === 'Enter') && activeSuggestion >= 0) {
      e.preventDefault();
      setInputValue(filteredSuggestions[activeSuggestion]);
      setFilteredSuggestions([]);
      
      if (e.key === 'Enter') {
        handleSendMessage(filteredSuggestions[activeSuggestion]);
      } else {
        inputRef.current?.focus();
      }
    }
    // Enter to send current input
    else if (e.key === 'Enter' && !isLoading) {
      handleSendMessage(inputValue);
    }
  };

  // Format message text to display tables
  const formatMessageText = (text: string) => {
    // Check if the message contains markdown-style tables
    if (text.includes('|') && text.includes('----')) {
      return (
        <div>
          {text.split('\n\n').map((paragraph, idx) => {
            // If paragraph contains a table
            if (paragraph.includes('|') && paragraph.includes('----')) {
              const tableLines = paragraph.trim().split('\n');
              const headerRow = tableLines[0].split('|').filter(cell => cell.trim() !== '');
              const hasHeaders = tableLines.length > 1 && tableLines[1].includes('----');
              const startRow = hasHeaders ? 2 : 0;
              
              return (
                <div key={idx} className="overflow-x-auto my-2">
                  <table className="min-w-full divide-y divide-gray-300 border border-gray-200 rounded">
                    {hasHeaders && (
                      <thead className="bg-gray-50">
                        <tr>
                          {headerRow.map((cell, cellIdx) => (
                            <th key={cellIdx} className="px-3 py-2 text-xs font-medium text-gray-700 text-left">
                              {cell.trim()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody className="divide-y divide-gray-200">
                      {tableLines.slice(startRow).map((row, rowIdx) => {
                        if (!row.includes('|')) return null;
                        const cells = row.split('|').filter(cell => cell !== '');
                        return (
                          <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {cells.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-3 py-2 text-xs text-gray-700">
                                {cell.trim()}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            } 
            // Regular paragraph
            else {
              return <p key={idx} className="mb-2">{paragraph}</p>;
            }
          })}
        </div>
      );
    }
    
    // If no table, just return the text with new lines
    return (
      <div>
        {text.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="mb-2">
            {paragraph.split('\n').map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {line}
                {lineIdx < paragraph.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        ))}
      </div>
    );
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const apiKey = process.env.REACT_APP_PERPLEXITY_API_KEY?.trim();
    if (!apiKey) {
      setMessages(prev => [...prev, {
        text: "Configuration Error: API key not found. Check environment variables.",
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
    setFilteredSuggestions([]);

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
            ? `Error: ${error.message}. Try again later.`
            : "An unexpected error occurred. Try again later.",
          isUser: false,
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
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
        <div className="bg-white rounded-lg shadow-xl w-[450px] max-w-full flex flex-col" style={{ height: '600px' }}>
          {/* Header */}
          <div className="p-3 border-b flex justify-between items-center bg-blue-500 text-white rounded-t-lg">
            <h3 className="font-medium">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-2" style={{ scrollBehavior: 'smooth' }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[95%] p-3 rounded-lg ${
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
                    <div className="font-sans text-sm">
                      {formatMessageText(message.text)}
                    </div>
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

          {/* Input with inline suggestions */}
          <div className="border-t p-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                disabled={isLoading}
                className={`w-full border rounded-full px-4 py-2 pr-10 focus:outline-none focus:border-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className={`absolute right-1 top-1 bg-blue-500 text-white rounded-full p-1.5 hover:bg-blue-600 ${
                  (isLoading || !inputValue.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
              
              {/* Inline Suggestions */}
              {filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                        index === activeSuggestion ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => {
                        setInputValue(suggestion);
                        setFilteredSuggestions([]);
                        inputRef.current?.focus();
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Suggestions - small pills below input */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {allSuggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={isLoading}
                  className={`text-xs bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 hover:bg-gray-200 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {suggestion.length > 25 ? suggestion.substring(0, 22) + '...' : suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 