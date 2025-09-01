"use server";

import { connectToDatabase } from "@/lib/database/connect";
import Vendor from "@/lib/database/models/vendor.model";
import { cookies } from "next/headers";

export const loginVendor = async (email: string, password: string) => {
  try {
    await connectToDatabase();

    if (!email || !password) {
      return { message: "Please fill in all fields", success: false };
    }

    const vendor = await Vendor.findOne({ email }).select("+password");
    if (!vendor) {
      return { message: "Vendor doesn't exist.", success: false };
    }

    const isPasswordValid = await vendor.comparePassword(password);
    if (!isPasswordValid) {
      return { message: "Password is incorrect.", success: false };
    }

    const token = vendor.getJWTToken();
    const cookieStore = await cookies();

    // 🔹 Same short-lived session cookie
    cookieStore.set("vendor_token", token, {
      maxAge: 2 * 60 * 60, // 2 hours
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return {
      message: "Login Successful.",
      vendor: JSON.parse(JSON.stringify(vendor)),
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return { message: "An error occurred during login.", success: false };
  }
};
