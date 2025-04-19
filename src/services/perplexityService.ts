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

export async function getPerplexityResponse(
  userQuery: string,
  orders: Order[],
  inventory: InventoryItem[]
): Promise<string> {
  try {
    // Debug logging for environment variables
    console.log('Environment variables:', {
      hasKey: !!process.env.REACT_APP_PERPLEXITY_API_KEY,
      keyLength: process.env.REACT_APP_PERPLEXITY_API_KEY?.length
    });

    const apiKey = process.env.REACT_APP_PERPLEXITY_API_KEY?.trim();
    
    if (!apiKey) {
      throw new Error('Perplexity API key not found. Please check your environment variables.');
    }

    // Process order data for insights
    const shippedOrders = orders.filter(o => o.status === "Shipped");
    const cancelledOrders = orders.filter(o => o.status === "Cancelled");
    const totalRevenue = shippedOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);

    // Process inventory data
    const lowStock = inventory.filter(i => i.quantity < 10);
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate recent performance
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const last30DaysSales = shippedOrders.filter(order => 
      new Date(order.orderDate) >= last30Days
    );

    // Prepare context with business metrics
    const context = `You are an AI assistant for an Amazon seller dashboard. You help sellers analyze their sales and inventory data.
You should be professional, concise, and helpful. Always format currency in Indian Rupees (₹).
When analyzing data, focus on providing actionable insights that can help the seller improve their business.

Current Business Metrics:
- Total Orders: ${orders.length}
- Shipped Orders: ${shippedOrders.length}
- Cancelled Orders: ${cancelledOrders.length}
- Total Revenue: ₹${totalRevenue.toFixed(2)}

Inventory Status:
- Total SKUs: ${inventory.length}
- Low Stock Items: ${lowStock.length}
- Total Inventory Value: ₹${totalInventoryValue.toFixed(2)}

Recent Performance:
- Last 30 Days Sales: ${last30DaysSales.length} orders
- Average Daily Sales: ${(last30DaysSales.length / 30).toFixed(1)} orders

Recent Orders Sample:
${JSON.stringify(orders.slice(0, 3), null, 2)}

Low Stock Items Sample:
${JSON.stringify(lowStock.slice(0, 3), null, 2)}

Instructions:
1. Keep responses concise and focused
2. Use bullet points for lists
3. Format all currency values in Indian Rupees (₹)
4. Provide specific, data-driven insights
5. Suggest actionable recommendations when relevant`;

    console.log('Making API request to Perplexity...');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: context
          },
          {
            role: 'user',
            content: userQuery
          }
        ],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.8
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response received:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length
    });

    let text = data.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.';
    
    // Post-process the response
    text = text.replace(/\$(\d+)/g, '₹$1'); // Convert $ to ₹
    text = text.replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines
    
    return text;
  } catch (error) {
    console.error('Error in Perplexity service:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'Configuration Error: The AI service is not properly configured. Please check that your API key is correctly set in the .env file and restart the development server.';
      }
      if (error.message.includes('429')) {
        return 'Rate limit exceeded. Please try again in a few moments.';
      }
      if (error.message.includes('403')) {
        return 'Access denied. Please check your API key permissions.';
      }
      return `I encountered an error: ${error.message}. Please try again or contact support if the issue persists.`;
    }
    
    return 'An unexpected error occurred. Please try again later.';
  }
} 