"use server";

import { connectToDatabase } from "@/lib/database/connect";
import Order from "@/lib/database/models/order.model";
import Product from "@/lib/database/models/product.model";
import User from "@/lib/database/models/user.model";
import { verify_vendor } from "@/utils";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

interface Vendor {
  id: typeof ObjectId;
  name: string;
}

// get dashboard data for vendor

export const getDashboardData = async () => {
  try {
    await connectToDatabase();
    const vendor = await verify_vendor() ;
    if (!vendor) {
      throw new Error("Vendor not verified");
    }
    const vendorName = vendor.name;
    const orders = await Order.find({
      "products.vendor._id": vendor?.id,
    })
      .populate({ path: "user", model: User })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const products = await Product.find({
      "vendor._id": vendor?.id,
    }).lean();
    return {
      orders: JSON.parse(JSON.stringify(orders)),
      products: JSON.parse(JSON.stringify(products)),
      vendor: vendorName, 
      lowStockProducts: JSON.parse(JSON.stringify(await getLowStockProducts())),
      outOfStockProducts: JSON.parse(JSON.stringify(await getOutOfStockProducts())),
    };
  } catch (error: any) {
    console.log(error);
  }return {
      orders: [],
      products: [],
      vendor: "Vendor",
      lowStockProducts: [], 
      outOfStockProducts: []
    };
};

// PRODUCTS:
// fetch low stock products for vendor
export const getLowStockProducts = async () => {
  try {
    await connectToDatabase();
    const vendor = await verify_vendor();

    const lowStockProducts = await Product.find(
      {
        "subProducts.sizes.qty": { $lte: 5 },
        "vendor._id": vendor?.id,
      },
      {
        name: 1,
        "subProducts.sizes.qty": 1,
        "subProducts.size.size": 1,
        "subProducts._id": 1,
      }
    );
    return {
      lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)),
    };
  } catch (error: any) {
    console.log(error);
  }
};

// fetch out of stock products for vendor
export const getOutOfStockProducts = async () => {
  try {
    await connectToDatabase();
    const vendor = await verify_vendor();

    const outOfStockProducts = await Product.find(
      {
        "subProducts.sizes.qty": { $eq: 0 },
        "vendor._id": vendor?.id,
      },
      {
        name: 1,
        "subProducts.sizes.qty": 1,
        "subProducts.size.size": 1,
        "subProducts._id": 1,
      }
    );
    return {
      outOfStockProducts: JSON.parse(JSON.stringify(outOfStockProducts)),
    };
  } catch (error: any) {
    console.log(error);
  }
};

// ORDERS:
// calculate today, yesterday, this week, last week, this month, last month + growth
export const calculateTotalOrders = async () => {
  try {
    await connectToDatabase();
    const vendor = await verify_vendor();

    const orders = await Order.find({
      "products.vendor._id": vendor?.id,
    });

    const now = new Date();

    // Helpers
    const startOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };
    const endOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(23, 59, 59, 999);
      return d;
    };

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const yesterdayStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    const yesterdayEnd = endOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

    const weekStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()));
    const lastWeekStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7));
    const lastWeekEnd = endOfDay(new Date(weekStart.getTime() - 1));

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // end of previous month

    // Totals
    let totalSales = 0,
      todaySales = 0,
      yesterdaySales = 0,
      thisWeekSales = 0,
      lastWeekSales = 0,
      thisMonthSales = 0,
      lastMonthSales = 0;

    orders.forEach((order) => {
      const created = new Date(order.createdAt);
      const total = order.total;
      totalSales += total;

      if (created >= todayStart && created <= todayEnd) todaySales += total;
      if (created >= yesterdayStart && created <= yesterdayEnd) yesterdaySales += total;

      if (created >= weekStart) thisWeekSales += total;
      if (created >= lastWeekStart && created <= lastWeekEnd) lastWeekSales += total;

      if (created >= monthStart) thisMonthSales += total;
      if (created >= lastMonthStart && created <= lastMonthEnd) lastMonthSales += total;
    });

    // Growth calcs
    const safeDivide = (curr: number, prev: number) =>
      prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;

    const dayGrowth = safeDivide(todaySales, yesterdaySales);
    const weekGrowth = safeDivide(thisWeekSales, lastWeekSales);
    const monthGrowth = safeDivide(thisMonthSales, lastMonthSales);

    return {
      totalSales,
      todaySales,
      yesterdaySales,
      thisWeekSales,
      lastWeekSales,
      thisMonthSales,
      lastMonthSales,
      growth: {
        day: dayGrowth.toFixed(2),
        week: weekGrowth.toFixed(2),
        month: monthGrowth.toFixed(2),
      },
    };
  } catch (error: any) {
    console.error(error);
    return {
      totalSales: 0,
      todaySales: 0,
      yesterdaySales: 0,
      thisWeekSales: 0,
      lastWeekSales: 0,
      thisMonthSales: 0,
      lastMonthSales: 0,
      growth: { day: "0.00", week: "0.00", month: "0.00" },
    };
  }
};


// calculates new orders, pending orders, completed orders, canceled orders
export const orderSummary = async () => {
  try {
    await connectToDatabase();
    const vendor = await verify_vendor();

    // count new order documents
    const newOrders = await Order.countDocuments({
      isNew: true,
      "products.vendor._id": vendor?.id,
    });
    const pendingOrders = await Order.countDocuments({
      "products.status": "Not Processed",
      "products.vendor._id": vendor?.id,
    });
    const completedOrders = await Order.countDocuments({
      "products.status": "Completed",
      "products.vendor._id": vendor?.id,
    });
    const cancelledOrders = await Order.countDocuments({
      "products.status": "Cancelled",
      "products.vendor._id": vendor?.id,
    });
    return {
      newOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    };
  } catch (error: any) {
    console.log(error);
  }
};
