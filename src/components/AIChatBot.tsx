import React, { useState } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatBotProps {
  orders: any[];
  inventory: any[];
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

  const predefinedQuestions = [
    "What are my top selling products?",
    "How many items are low in stock?",
    "What's my total revenue this week?",
    "Show me cancelled orders analysis"
  ];

  const getAnswer = (question: string): string => {
    const shippedOrders = orders.filter(o => o["order-status"].includes("Shipped"));
    const cancelledOrders = orders.filter(o => o["order-status"].includes("Cancelled"));
    const lowStock = inventory.filter(i => parseInt(i.quantity || "0") < 10);

    // Group orders by ASIN and calculate quantities
    const salesByAsin = shippedOrders.reduce((acc: any, order) => {
      const asin = order.asin;
      if (!acc[asin]) {
        acc[asin] = {
          quantity: 0,
          revenue: 0,
          name: order["product-name"]
        };
      }
      acc[asin].quantity += parseInt(order.quantity || "1");
      acc[asin].revenue += parseFloat(order["item-price"] || "0");
      return acc;
    }, {});

    // Calculate total revenue for the current week
    const thisWeekRevenue = shippedOrders
      .filter(order => {
        const orderDate = new Date(order["purchase-date"]);
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      })
      .reduce((sum, order) => sum + parseFloat(order["item-price"] || "0"), 0);

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const questionLower = question.toLowerCase();
    
    if (questionLower.includes("top selling")) {
      const topProducts = Object.entries(salesByAsin)
        .sort(([, a]: any, [, b]: any) => b.quantity - a.quantity)
        .slice(0, 3);
      
      return `Here are your top 3 selling products:\n${topProducts.map(([asin, data]: any, index) => 
        `${index + 1}. ${data.name} (${asin}): ${data.quantity} units sold - ${formatCurrency(data.revenue)}`
      ).join('\n')}`;
    }
    
    if (questionLower.includes("low in stock")) {
      return `You have ${lowStock.length} items that are low in stock (less than 10 units).\n${lowStock.slice(0, 3).map(item => 
        `- ${item["product-name"]} (${item.asin}): ${item.quantity} units remaining`
      ).join('\n')}`;
    }
    
    if (questionLower.includes("revenue")) {
      return `Your total revenue for this week is ${formatCurrency(thisWeekRevenue)}`;
    }
    
    if (questionLower.includes("cancelled")) {
      const cancelReasons = cancelledOrders.reduce((acc: any, order) => {
        const reason = order["cancellation-reason"] || "Unknown";
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {});
      
      const topReasons = Object.entries(cancelReasons)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 3);
      
      return `You have ${cancelledOrders.length} cancelled orders.\nTop cancellation reasons:\n${topReasons.map(([reason, count]) => 
        `- ${reason}: ${count} orders`
      ).join('\n')}`;
    }

    return "I'm sorry, I don't understand that question. Please try one of the suggested questions or rephrase your query.";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    const aiResponse: Message = {
      text: getAnswer(inputValue),
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, aiResponse]);
    setInputValue('');
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
    handleSendMessage();
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
            <h3 className="font-medium">AI Seller Assistant</h3>
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
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {message.text}
                  </pre>
                  <div className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Questions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">Suggested questions:</div>
            <div className="flex flex-wrap gap-2">
              {predefinedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-100"
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
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
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