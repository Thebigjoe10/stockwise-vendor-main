"use client";

import {
  getTopSellingProducts,
  sizeAnalytics,
} from "@/lib/database/actions/vendor/analytics/analytics.actions";
import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];

const ProductData = () => {
  const [sizeData, setSizeData] = useState<{ size: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    async function fetchSizeDataForProduct() {
  try {
    const res = await sizeAnalytics();

    if (res?.success) {
      setSizeData(res.data); // already in [{ name, value }]
    } else {
      console.warn("Size analytics error:", res?.message || "Unknown error");
      setSizeData([]);
    }
  } catch (err) {
    console.error("Error fetching size analytics:", err);
    setSizeData([]);
  }
}


   async function fetchTopSellingProducts() {
  try {
    const res = await getTopSellingProducts();
    if (Array.isArray(res)) {
      setTopProducts(res);
    } else {
      setTopProducts([]);
    }
  } catch (err) {
    console.error("Error fetching top products:", err);
    setTopProducts([]);
  }
}

    fetchSizeDataForProduct();
    fetchTopSellingProducts();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Size Performance Bar Chart */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Size Performance</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sizeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="size" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0088FE">
                {sizeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

     {/* Top Selling Products Pie Chart */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
        <div className="h-80 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topProducts}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {topProducts.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name: string, entry: any) => [
                  value,
                  entry.payload.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ProductData;
