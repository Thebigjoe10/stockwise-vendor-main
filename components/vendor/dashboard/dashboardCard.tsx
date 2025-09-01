"use client";
import React from "react";
import { SlHandbag } from "react-icons/sl";
import { SiProducthunt } from "react-icons/si";
import { GiTakeMyMoney } from "react-icons/gi";
import { BsThreeDotsVertical } from "react-icons/bs";

// ✅ Import currency utils
import { fmtMoney } from "@/utils/currency";

type Order = { total: number; isPaid: boolean };
type Data = {
  vendor?: string;
  country?: string;
  orders: Order[];
  products: any[];
};

const DashboardCard = ({ data }: { data: Data }) => {
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  const products = Array.isArray(data?.products) ? data.products : [];

  // 🧮 Totals
  const totalEarningsNum = orders.reduce((a, o) => a + (o?.total || 0), 0);
  const unpaidNum = orders
    .filter((o) => !o?.isPaid)
    .reduce((a, o) => a + (o?.total || 0), 0);

  const totalEarnings = fmtMoney(totalEarningsNum, data?.country, false);
  const unpaid = fmtMoney(unpaidNum, data?.country, true);

  // 🕒 Greeting
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="p-6">
      {/* Greeting */}
      <h2 className="text-xl font-semibold mb-6">
        {greeting},{" "}
        <span className="text-emerald-700">
          {data?.vendor ? `${data.vendor}!` : "Vendor!"}
        </span>
      </h2>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Orders */}
        <div className="relative bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold">
                {orders.length.toLocaleString()}
              </div>
              <div className="text-gray-500 text-sm mt-1">Total Orders</div>
            </div>
            <div className="rounded-full p-2 bg-violet-100">
              <SlHandbag className="text-violet-500" size={22} />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="relative bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold">
                {products.length.toLocaleString()}
              </div>
              <div className="text-gray-500 text-sm mt-1">Total Products</div>
            </div>
            <div className="rounded-full p-2 bg-orange-100">
              <SiProducthunt className="text-orange-500" size={22} />
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="relative bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold">{totalEarnings}</div>
              <div className="text-gray-500 text-sm mt-1">Total Earnings</div>
              <div className="text-xs text-gray-500 mt-2">
                − {unpaid} unpaid yet.
              </div>
            </div>
            <div className="rounded-full p-2 bg-pink-100">
              <GiTakeMyMoney className="text-pink-500" size={22} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
