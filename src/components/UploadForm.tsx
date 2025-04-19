import React from "react";

export function UploadForm({ setOrders, setInventory }: any) {
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
      if (type === "orders") setOrders(data);
      else setInventory(data);
    };
    reader.readAsText(file);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="font-medium">Upload Order Report</span>
          <input type="file" accept=".txt,.tsv" onChange={e => e.target.files && parseFile(e.target.files[0], "orders")} />
        </label>
        <label className="block">
          <span className="font-medium">Upload Inventory Report</span>
          <input type="file" accept=".txt,.tsv" onChange={e => e.target.files && parseFile(e.target.files[0], "inventory")} />
        </label>
      </div>
    </div>
  );
} 