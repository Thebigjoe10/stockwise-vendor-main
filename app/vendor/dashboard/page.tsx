import React from "react";
import {
  calculateTotalOrders,
  getDashboardData,
} from "@/lib/database/actions/vendor/dashboard/dashboard.actions";
import DashboardCard from "@/components/vendor/dashboard/dashboardCard";
import OrdersSummaryCard from "@/components/vendor/dashboard/OrdersSummaryCard";
import ProductData from "@/components/vendor/dashboard/product.perfomance";
import LowStockProducts from "@/components/vendor/dashboard/low-stock-products";
import OutOfStockProducts from "@/components/vendor/dashboard/out-of-stock-products";
import OrdersTable from "@/components/vendor/dashboard/OrdersTable";

// Main Vendor Dashboard Page

const VendorDashboardPage = async () => {
  const data = await getDashboardData().catch((err) => {
    console.error("Error fetching dashboard data:", err);
    return { orders: [], products: [], vendor: "Vendor" };
  });

  const allOrdersData = await calculateTotalOrders().catch((err) => {
    console.error("Error calculating totals:", err);
    return { totalSales: 0, todaySales: 0, thisMonthSales: 0, thisWeekSales: 0, lastMonthSales: 0, growth: { day: "0.00", week: "0.00", month: "0.00" }, day: 0, week: 0, month: 0 };
  });

  return (
    <div className="container mx-auto p-4">
      {/* Dashboard cards */}
      <div className="my-6">
        {/* Pass only JSON-serializable data */}
        <DashboardCard
          data={{
            vendor: data?.vendor || "Vendor",
            orders: Array.isArray(data?.orders) ? data.orders : [],
            products: Array.isArray(data?.products) ? data.products : [],
          }}
        />
      </div>

      {/* Orders summary */}
        <div className="titleStyle">Orders</div>
        <OrdersSummaryCard
          totalSales={allOrdersData?.totalSales || 0}
          todaySales={allOrdersData?.todaySales || 0 }
          thisMonthSales={allOrdersData?.thisMonthSales || 0}
          lastMonthSales={allOrdersData?.lastMonthSales || 0}
          thisWeekSales={allOrdersData?.thisWeekSales || 0}
          growth={allOrdersData?.growth || { day: "0.00", week: "0.00", month: "0.00" }}
        />
      {/* Recent Orders */}
      <div className="my-6">
        <OrdersTable data={{ orders: data?.orders || [] }} />
      </div>
      {/* Product stats */}
      <ProductData />
      <LowStockProducts />
      <OutOfStockProducts />
    </div>
  );
};

export default VendorDashboardPage;
