import React, { useState } from "react";
import { differenceInDays, parseISO, format } from "date-fns";

export function Dashboard({ orders, inventory }: any) {
  const [activeTab, setActiveTab] = useState<'summary' | 'sales' | 'lowStock' | 'analytics'>('summary');
  const today = new Date();

  const shippedOrders = orders.filter((o: any) => o["order-status"].includes("Shipped"));
  const cancelledOrders = orders.filter((o: any) => o["order-status"].includes("Cancelled"));
  const totalRevenue = shippedOrders.reduce((sum: number, o: any) => sum + parseFloat(o["item-price"] || "0"), 0);

  const groupedByASIN = shippedOrders.reduce((acc: any, o: any) => {
    const asin = o.asin;
    const daysAgo = differenceInDays(today, parseISO(o["purchase-date"]));
    const qty = parseInt(o.quantity || "0");
    if (!acc[asin]) acc[asin] = { d3: 0, d7: 0, d30: 0, name: o["product-name"] || "Unknown Product" };
    if (daysAgo <= 3) acc[asin].d3 += qty;
    if (daysAgo <= 7) acc[asin].d7 += qty;
    if (daysAgo <= 30) acc[asin].d30 += qty;
    return acc;
  }, {});

  const stockByASIN = inventory.reduce((acc: any, i: any) => {
    acc[i.asin] = i.quantity;
    return acc;
  }, {});

  const lowStock = inventory.filter((i: any) => parseInt(i.quantity || "0") < 10);
  
  const topSellingASINs = Object.entries(groupedByASIN)
    .sort((a: any, b: any) => b[1].d30 - a[1].d30)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md p-6">
          <div className="text-blue-100 text-sm mb-1">Total Shipped Orders</div>
          <div className="text-3xl font-bold">{shippedOrders.length}</div>
          <div className="flex justify-between mt-2">
            <div className="text-blue-100 text-sm">Across {Object.keys(groupedByASIN).length} unique products</div>
            <div className="text-blue-100 text-sm">
              {(() => {
                const totalQty = shippedOrders.reduce((sum: number, o: any) => sum + parseInt(o.quantity || "1"), 0);
                return `${totalQty} items`;
              })()}
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-md p-6">
          <div className="text-indigo-100 text-sm mb-1">Total Revenue</div>
          <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
          <div className="flex justify-between mt-2">
            <div className="text-indigo-100 text-sm">
              {(() => {
                const avgOrderValue = shippedOrders.length > 0 
                  ? formatCurrency(totalRevenue / shippedOrders.length) 
                  : formatCurrency(0);
                return `Avg. order: ${avgOrderValue}`;
              })()}
            </div>
            <div className="text-indigo-100 text-sm">
              {(() => {
                // Calculate revenue from last 7 days
                const last7DaysRevenue = shippedOrders
                  .filter((o: any) => differenceInDays(today, parseISO(o["purchase-date"])) <= 7)
                  .reduce((sum: number, o: any) => sum + parseFloat(o["item-price"] || "0"), 0);
                return `Last 7d: ${formatCurrency(last7DaysRevenue)}`;
              })()}
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-md p-6">
          <div className="text-red-100 text-sm mb-1">Low Stock Items</div>
          <div className="text-3xl font-bold">{lowStock.length}</div>
          <div className="flex justify-between mt-2">
            <div className="text-red-100 text-sm">
              {(() => {
                const criticalStock = inventory.filter((i: any) => parseInt(i.quantity || "0") <= 3).length;
                return `${criticalStock} critical (≤ 3 units)`;
              })()}
            </div>
            <div className="text-red-100 text-sm">
              {(() => {
                const totalItems = inventory.length;
                return totalItems > 0 ? `${Math.round((lowStock.length / totalItems) * 100)}% of catalog` : '0% of catalog';
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px overflow-x-auto">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'summary' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Summary
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'sales' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sales Analysis
          </button>
          <button 
            onClick={() => setActiveTab('lowStock')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'lowStock' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Low Stock Items
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'analytics' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Advanced Analytics
          </button>
        </nav>
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Selling Products</h2>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {topSellingASINs.map(([asin, data]: any, index: number) => (
              <div key={asin} className="bg-white border rounded-lg shadow-sm p-4 flex items-center">
                <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{data.name.length > 60 ? data.name.substring(0, 60) + '...' : data.name}</h3>
                  <div className="text-sm text-gray-500 mt-1">ASIN: {asin}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{data.d30} units</div>
                  <div className="text-sm text-gray-500">sold in 30 days</div>
                </div>
                <div className="ml-6 text-right">
                  <div className="text-lg font-semibold">{stockByASIN[asin] || 0}</div>
                  <div className="text-sm text-gray-500">in stock</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-blue-800">Dashboard Overview</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This dashboard provides an overview of your Amazon sales and inventory status. 
                  Use the tabs above to view detailed sales analysis and low stock items.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Analysis Tab */}
      {activeTab === 'sales' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sales Summary (Last 3 / 7 / 30 days)</h2>
          <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
            <table className="table-auto w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASIN & Product</th>
                  <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">3 Days</th>
                  <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">7 Days</th>
                  <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">30 Days</th>
                  <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Left</th>
                  <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Days Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(groupedByASIN).map(([asin, vals]: any) => {
                  // Calculate average daily sales based on the last 7 days
                  const dailyAvg = vals.d7 / 7;
                  // Calculate approximately how many days of stock remain
                  const daysRemaining = dailyAvg > 0 ? Math.round((stockByASIN[asin] || 0) / dailyAvg) : 999;
                  
                  return (
                    <tr key={asin} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{asin}</div>
                        <div className="text-sm text-gray-500">{vals.name?.slice(0, 40)}...</div>
                      </td>
                      <td className="px-4 py-3 text-center">{vals.d3}</td>
                      <td className="px-4 py-3 text-center">{vals.d7}</td>
                      <td className="px-4 py-3 text-center">{vals.d30}</td>
                      <td className="px-4 py-3 text-center">{stockByASIN[asin] || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          daysRemaining < 7 ? 'bg-red-100 text-red-800' : 
                          daysRemaining < 15 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {daysRemaining === 999 ? '∞' : daysRemaining} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Tab */}
      {activeTab === 'lowStock' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Low Stock Items (Stock &lt; 10)</h2>
          
          {lowStock.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Low Stock Items</h3>
              <p className="mt-2 text-sm text-gray-500">All your inventory items have stock levels above the threshold.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
              <table className="table-auto w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASIN</th>
                    <th className="border-b px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="border-b px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lowStock.map((item: any, idx: number) => {
                    const quantity = parseInt(item.quantity || "0");
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.asin}</td>
                        <td className="px-4 py-3 text-gray-500">{item.sku}</td>
                        <td className="px-4 py-3 text-gray-500">{item["product-name"] || "Unknown Product"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${quantity <= 3 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            quantity <= 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {quantity <= 3 ? 'Critical' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Advanced Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Advanced Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Inventory Health Analysis */}
            <div className="bg-white rounded-lg border shadow-sm p-5">
              <h3 className="font-medium text-lg text-gray-800 mb-4">Inventory Health</h3>
              
              {(() => {
                // Calculate inventory health
                const totalInventory = inventory.reduce((total: number, item: any) => total + parseInt(item.quantity || "0"), 0);
                const inventoryValue = inventory.reduce((total: number, item: any) => {
                  const price = parseFloat(item["price"] || "0");
                  const qty = parseInt(item.quantity || "0");
                  return total + (price * qty);
                }, 0);
                
                // Calculate inventory turnover
                const totalSold30Days = Object.values(groupedByASIN).reduce((sum: number, val: any) => sum + val.d30, 0);
                const turnoverRate = totalInventory > 0 ? (totalSold30Days / totalInventory) * 100 : 0;
                
                // Identify stagnant inventory
                const stagnantItems = inventory.filter((item: any) => {
                  const asin = item.asin;
                  const sales = groupedByASIN[asin]?.d30 || 0;
                  return sales === 0 && parseInt(item.quantity || "0") > 0;
                });
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-700">Total Items</div>
                        <div className="text-2xl font-bold text-blue-900">{totalInventory}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-green-700">Inventory Value</div>
                        <div className="text-2xl font-bold text-green-900">{formatCurrency(inventoryValue)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Inventory Turnover Rate (30 days)</h4>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${turnoverRate < 15 ? 'bg-red-500' : turnoverRate < 30 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                          style={{ width: `${Math.min(turnoverRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{turnoverRate.toFixed(1)}% of inventory sold in last 30 days</span>
                        <span className={turnoverRate < 15 ? 'text-red-600' : turnoverRate < 30 ? 'text-yellow-600' : 'text-green-600'}>
                          {turnoverRate < 15 ? 'Low' : turnoverRate < 30 ? 'Average' : 'Good'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Stagnant Inventory</h4>
                      {stagnantItems.length === 0 ? (
                        <p className="text-green-600 text-sm">No stagnant inventory detected! All items have sales.</p>
                      ) : (
                        <div className="text-red-600 text-sm">{stagnantItems.length} items with no sales in last 30 days</div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* Replenishment Recommendations */}
            <div className="bg-white rounded-lg border shadow-sm p-5">
              <h3 className="font-medium text-lg text-gray-800 mb-4">Replenishment Recommendations</h3>
              {(() => {
                // Calculate items that need to be reordered based on sales velocity
                const reorderItems = Object.entries(groupedByASIN)
                  .map(([asin, data]: any) => {
                    const currentStock = stockByASIN[asin] || 0;
                    const dailySales = data.d30 / 30; // Average daily sales
                    const daysRemaining = dailySales > 0 ? Math.round(currentStock / dailySales) : 999;
                    const reorderNeeded = daysRemaining < 30;
                    const suggestedOrder = Math.max(Math.ceil(dailySales * 60) - currentStock, 0); // 60 days of stock
                    
                    return {
                      asin,
                      name: data.name,
                      currentStock,
                      daysRemaining,
                      reorderNeeded,
                      suggestedOrder
                    };
                  })
                  .filter(item => item.reorderNeeded)
                  .sort((a, b) => a.daysRemaining - b.daysRemaining);
                
                return (
                  <div>
                    {reorderItems.length === 0 ? (
                      <div className="bg-green-50 p-4 rounded-lg text-green-800">
                        <div className="font-medium">No reorders needed</div>
                        <p className="text-sm mt-1">All items have sufficient stock for the next 30 days.</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-3">{reorderItems.length} items need replenishment in the next 30 days</p>
                        <div className="overflow-y-auto max-h-64">
                          {reorderItems.map((item) => (
                            <div key={item.asin} className="border-b border-gray-100 pb-3 mb-3 last:mb-0 last:border-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-gray-800">{item.asin}</div>
                                  <div className="text-sm text-gray-500">{item.name?.slice(0, 30)}...</div>
                                </div>
                                <div className="ml-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    item.daysRemaining < 7 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {item.daysRemaining} days left
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 text-sm">
                                <span className="text-gray-600">Current stock: {item.currentStock}</span> · 
                                <span className="ml-2 text-indigo-600 font-medium">Order: {item.suggestedOrder}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales Trend Analysis */}
            <div className="bg-white rounded-lg border shadow-sm p-5">
              <h3 className="font-medium text-lg text-gray-800 mb-4">Sales Trends</h3>
              {(() => {
                const salesByDay = shippedOrders.reduce((acc: Record<string, number>, order: any) => {
                  const date = format(parseISO(order["purchase-date"]), 'yyyy-MM-dd');
                  if (!acc[date]) acc[date] = 0;
                  acc[date] += parseInt(order.quantity || "0");
                  return acc;
                }, {});

                const dates = Object.keys(salesByDay).sort();
                const last14Days = dates.slice(-14);

                const lastWeekSales = last14Days.slice(-7).reduce((sum, date) => sum + (salesByDay[date] || 0), 0);
                const prevWeekSales = last14Days.slice(-14, -7).reduce((sum, date) => sum + (salesByDay[date] || 0), 0);
                const growthRate = prevWeekSales > 0 ? ((lastWeekSales - prevWeekSales) / prevWeekSales) * 100 : 0;

                const maxSales = Math.max(...Object.values(salesByDay));

                return (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="font-medium">Weekly Growth</div>
                      <div className={`text-sm font-medium ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {growthRate >= 0 ? '↑' : '↓'} {Math.abs(growthRate).toFixed(1)}%
                      </div>
                    </div>

                    <div className="h-40 flex items-end space-x-1">
                      {last14Days.map((date, i) => {
                        const salesValue = salesByDay[date] || 0;
                        const height = maxSales > 0 ? Math.max((salesValue / maxSales) * 100, 5) : 0;
                        
                        return (
                          <div key={date} className="flex-1 flex flex-col items-center">
                            <div 
                              className={`w-full ${i >= 7 ? 'bg-blue-500' : 'bg-gray-300'}`} 
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="text-xs mt-1 -rotate-90 origin-top-left transform translate-y-6 whitespace-nowrap">
                              {format(new Date(date), 'MM/dd')}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between mt-10 text-xs text-gray-600">
                      <div>Previous Week</div>
                      <div>Current Week</div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* Cancelled Order Analysis */}
            <div className="bg-white rounded-lg border shadow-sm p-5">
              <h3 className="font-medium text-lg text-gray-800 mb-4">Cancellation Analysis</h3>
              {(() => {
                // Calculate cancellation rate
                const totalOrders = shippedOrders.length + cancelledOrders.length;
                const cancellationRate = totalOrders > 0 ? (cancelledOrders.length / totalOrders) * 100 : 0;
                
                // Group cancellations by reason
                const cancelReasons = cancelledOrders.reduce((acc: any, order: any) => {
                  const reason = order["cancellation-reason"] || "Unknown";
                  if (!acc[reason]) acc[reason] = 0;
                  acc[reason]++;
                  return acc;
                }, {});
                
                // Get top cancellation reasons
                const topReasons = Object.entries(cancelReasons)
                  .sort((a: any, b: any) => b[1] - a[1])
                  .slice(0, 3);
                
                return (
                  <div>
                    <div className="flex justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Cancellation Rate</div>
                        <div className="text-2xl font-bold">{cancellationRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Cancelled</div>
                        <div className="text-2xl font-bold">{cancelledOrders.length}</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Top Cancellation Reasons</h4>
                      {topReasons.length > 0 ? (
                        <div className="space-y-2">
                          {topReasons.map(([reason, count]: any) => (
                            <div key={reason} className="flex justify-between">
                              <div className="text-sm">{reason}</div>
                              <div className="text-sm font-medium">{count} orders</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">No cancellation data available</div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Improve your performance:</span> Monitor cancellation reasons and address common issues to reduce cancellation rate.
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 