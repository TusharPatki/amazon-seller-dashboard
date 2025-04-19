import React from "react";
import { differenceInDays, parseISO } from "date-fns";

export function Dashboard({ orders, inventory }: any) {
  const today = new Date();

  const shippedOrders = orders.filter((o: any) => o["order-status"].includes("Shipped"));
  const cancelledOrders = orders.filter((o: any) => o["order-status"].includes("Cancelled"));

  const groupedByASIN = shippedOrders.reduce((acc: any, o: any) => {
    const asin = o.asin;
    const daysAgo = differenceInDays(today, parseISO(o["purchase-date"]));
    const qty = parseInt(o.quantity || "0");
    if (!acc[asin]) acc[asin] = { d3: 0, d7: 0, d30: 0 };
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

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4">Total Shipped: {shippedOrders.length}</div>
        <div className="bg-white shadow rounded-xl p-4">Total Cancelled: {cancelledOrders.length}</div>
        <div className="bg-white shadow rounded-xl p-4">
          Top 5 ASINs: {Object.entries(groupedByASIN).sort((a: any, b: any) => b[1].d30 - a[1].d30).slice(0, 5).map(([asin]) => asin).join(", ")}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Sales Summary (Last 3 / 7 / 30 days)</h2>
      <table className="table-auto w-full mb-8">
        <thead>
          <tr>
            <th className="border px-2 py-1">ASIN</th>
            <th className="border px-2 py-1">3 Days</th>
            <th className="border px-2 py-1">7 Days</th>
            <th className="border px-2 py-1">30 Days</th>
            <th className="border px-2 py-1">Stock Left</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByASIN).map(([asin, vals]: any) => (
            <tr key={asin}>
              <td className="border px-2 py-1">{asin}</td>
              <td className="border px-2 py-1">{vals.d3}</td>
              <td className="border px-2 py-1">{vals.d7}</td>
              <td className="border px-2 py-1">{vals.d30}</td>
              <td className="border px-2 py-1">{stockByASIN[asin] || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-2">Low Stock Items (Stock &lt; 10)</h2>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="border px-2 py-1">ASIN</th>
            <th className="border px-2 py-1">SKU</th>
            <th className="border px-2 py-1">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {lowStock.map((item: any, idx: number) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{item.asin}</td>
              <td className="border px-2 py-1">{item.sku}</td>
              <td className="border px-2 py-1">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 