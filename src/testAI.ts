const testAI = async () => {
  try {
    // Get API key from environment variable
    const apiKey = process.env.REACT_APP_PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.error('API key is missing. Please check your environment variables.');
      return;
    }

    console.log('Testing API key...');
    
    // Test with a simple prompt using Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-small-chat', // Using the same model as the main service
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.error?.message || 'API request failed');
    }

    console.log('API Test Successful!');
    console.log('Response:', data);
    
    return true;
  } catch (error) {
    console.error('API Test Failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return false;
  }
};

export default testAI; 