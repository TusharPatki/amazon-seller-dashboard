import React, { useState } from "react";

export function UploadForm({ setOrders, setInventory }: any) {
  const [orderFile, setOrderFile] = useState<string | null>(null);
  const [inventoryFile, setInventoryFile] = useState<string | null>(null);

  const parseFile = (file: File, type: "orders" | "inventory") => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const rows = text.trim().split("\n");
      const headers = rows[0].split("\t");
      const data = rows.slice(1).map(row => {
        const values = row.split("\t");
        const entry: any = {};
        headers.forEach((h, i) => (entry[h] = values[i]));
        return entry;
      });
      
      if (type === "orders") {
        setOrders(data);
        setOrderFile(file.name);
      } else {
        setInventory(data);
        setInventoryFile(file.name);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors">
        <div className="flex flex-col items-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="font-semibold text-lg mb-2">Upload Order Report</h3>
          <p className="text-sm text-gray-600 mb-4">Upload your Amazon order report in TSV format</p>
          
          <label className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
            {orderFile ? "Change File" : "Select File"}
            <input 
              type="file" 
              accept=".txt,.tsv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={e => e.target.files && parseFile(e.target.files[0], "orders")} 
            />
          </label>
          
          {orderFile && (
            <div className="mt-4 text-sm">
              <span className="font-medium">File:</span> {orderFile}
              <div className="mt-1 text-green-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Uploaded successfully
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-2 border-dashed border-indigo-200 rounded-lg p-6 bg-indigo-50 hover:bg-indigo-100 transition-colors">
        <div className="flex flex-col items-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
          <h3 className="font-semibold text-lg mb-2">Upload Inventory Report</h3>
          <p className="text-sm text-gray-600 mb-4">Upload your Amazon inventory report in TSV format</p>
          
          <label className="relative cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
            {inventoryFile ? "Change File" : "Select File"}
            <input 
              type="file" 
              accept=".txt,.tsv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={e => e.target.files && parseFile(e.target.files[0], "inventory")} 
            />
          </label>
          
          {inventoryFile && (
            <div className="mt-4 text-sm">
              <span className="font-medium">File:</span> {inventoryFile}
              <div className="mt-1 text-green-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Uploaded successfully
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 