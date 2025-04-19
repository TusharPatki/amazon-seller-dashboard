import React, { useEffect, useState } from 'react';
import testAI from './testAI';

const TestAIPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Get the API key from environment variables
    const key = process.env.REACT_APP_PERPLEXITY_API_KEY;
    setApiKey(key ? 'Set' : 'Not Set');

    const runTest = async () => {
      try {
        const result = await testAI();
        if (result) {
          setTestResult('API Test Successful!');
          setResponse('API connection established successfully');
        } else {
          setTestResult('API Test Failed');
          setError('Failed to connect to the API');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setTestResult('API Test Failed');
      }
    };

    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">AI API Test</h1>
        
        <div className="mb-4">
          <p className="font-semibold">API Key Status:</p>
          <p className={apiKey === 'Set' ? 'text-green-600' : 'text-red-600'}>
            {apiKey}
          </p>
        </div>

        <div className="mb-4">
          <p className="font-semibold">Test Result:</p>
          <p className={testResult.includes('Successful') ? 'text-green-600' : 'text-red-600'}>
            {testResult}
          </p>
        </div>

        {response && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <p className="text-green-600 font-semibold">Response:</p>
            <p className="text-green-500">{response}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <p className="text-red-600 font-semibold">Error Details:</p>
            <p className="text-red-500 whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Note: Make sure your REACT_APP_PERPLEXITY_API_KEY is set in your environment variables.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestAIPage; 