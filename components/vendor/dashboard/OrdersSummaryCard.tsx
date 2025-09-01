"use client";
import React from "react";
import { GiTakeMyMoney } from "react-icons/gi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { fmtMoney } from "@/utils/currency";

type OrdersSummaryProps = {
  totalSales: number;
  todaySales: number;
  thisMonthSales: number;
  thisWeekSales: number;
  lastMonthSales: number;
  growth: {
    day: string;
    week: string;
    month: string;
  };
};

const OrdersSummaryCard = ({ totalSales, todaySales, thisMonthSales, thisWeekSales, lastMonthSales, growth }: OrdersSummaryProps) => {
  const total = fmtMoney(totalSales);
  const today = fmtMoney(todaySales);
  const thisWeek = fmtMoney(thisWeekSales);
  const thisMonth = fmtMoney(thisMonthSales);
  const lastMonth = fmtMoney(lastMonthSales);

  // Decide which growth metric to display (example: daily)
  const growthValue = parseFloat(growth.day);
  const growthValueWeek = parseFloat(growth.week);
  const growthValueMonth = parseFloat(growth.month);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6">
      {/* Total Sales */}
      <div className="relative bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-gray-500 text-sm mt-1">Total Sales</div>
          </div>
          <div className="rounded-full p-2 bg-emerald-100">
            <GiTakeMyMoney className="text-emerald-500" size={22} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded ${
              growthValueMonth >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
            }`}
          >
            {growthValueMonth >= 0 ? `+${growthValueMonth.toFixed(1)}%` : `${growthValueMonth.toFixed(1)}%`}
          </span>
          <BsThreeDotsVertical className="text-gray-400" />
        </div>
      </div>

      {/* Last Month Sales */}
      <div className="relative bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold">{lastMonth}</div>
            <div className="text-gray-500 text-sm mt-1">Last Month</div>
          </div>
          <div className="rounded-full p-2 bg-violet-100">
            <GiTakeMyMoney className="text-violet-500" size={22} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded ${
              growthValueMonth >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
            }`}
          >
            {growthValueMonth >= 0 ? `+${growthValueMonth.toFixed(1)}%` : `${growthValueMonth.toFixed(1)}%`}
          </span>
          <BsThreeDotsVertical className="text-gray-400" />
        </div>
      </div>

      {/* Growth (showing day/ week / month explicitly) */}
      <div className="relative bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold">{growthValue.toFixed(1)}%</div>
            <div className="text-gray-500 text-sm mt-1">Day Growth</div>
          </div>
          <div className="rounded-full p-2 bg-orange-100">
            <GiTakeMyMoney className="text-orange-500" size={22} />
          </div>
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold">{today}</div>
            <div className="text-gray-500 text-sm mt-1">Today Sales</div>
          </div>
          <div className="rounded-full p-2 bg-green-100">
            <GiTakeMyMoney className="text-green-500" size={22} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded ${
              growthValue >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
            }`}
          >
            {growthValue >= 0 ? `+${growthValue.toFixed(1)}%` : `${growthValue.toFixed(1)}%`}
          </span>
          <BsThreeDotsVertical className="text-gray-400" />
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold">{thisMonth}</div>
            <div className="text-gray-500 text-sm mt-1">This Month</div>
          </div>
          <div className="rounded-full p-2 bg-violet-100">
            <GiTakeMyMoney className="text-violet-500" size={22} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded ${
              growthValueMonth >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
            }`}
          >
            {growthValueMonth >= 0 ? `+${growthValueMonth.toFixed(1)}%` : `${growthValueMonth.toFixed(1)}%`}
          </span>
          <BsThreeDotsVertical className="text-gray-400" />
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold">{thisWeek}</div>
            <div className="text-gray-500 text-sm mt-1">This Week</div>
          </div>
          <div className="rounded-full p-2 bg-orange-100">
            <GiTakeMyMoney className="text-orange-500" size={22} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded ${
              growthValueWeek >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
            }`}
          >
            {growthValueWeek >= 0 ? `+${growthValueWeek.toFixed(1)}%` : `${growthValueWeek.toFixed(1)}%`}
          </span>
          <BsThreeDotsVertical className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default OrdersSummaryCard;
