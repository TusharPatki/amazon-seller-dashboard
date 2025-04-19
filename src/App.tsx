import React, { useState } from "react";
import { UploadForm } from "./UploadForm";
import { Dashboard } from "./Dashboard";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestAIPage from './TestAIPage';

const App: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
              <div className="max-w-screen-xl mx-auto p-6">
                <h1 className="text-3xl font-bold">Amazon Seller Dashboard</h1>
                <p className="text-blue-100 mt-2">Track inventory and analyze sales performance</p>
              </div>
            </header>

            <main className="max-w-screen-xl mx-auto p-6">
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Your Reports</h2>
                <UploadForm setOrders={setOrders} setInventory={setInventory} />
              </div>

              {orders.length === 0 && inventory.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No Data Available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Upload your Amazon order and inventory reports to see analytics and insights about your sales performance.
                  </p>
                </div>
              )}

              {orders.length > 0 && inventory.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <Dashboard orders={orders} inventory={inventory} />
                </div>
              )}
            </main>

            <footer className="max-w-screen-xl mx-auto p-6 text-center text-gray-600 text-sm">
              <p>© {new Date().getFullYear()} Amazon Seller Dashboard. All data is processed locally in your browser.</p>
            </footer>
          </div>
        } />
        <Route path="/test-ai" element={<TestAIPage />} />
      </Routes>
    </Router>
  );
};

export default App; 