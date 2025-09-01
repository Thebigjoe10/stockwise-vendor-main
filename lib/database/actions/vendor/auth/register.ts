"use server";

import { connectToDatabase } from "@/lib/database/connect";
import Vendor from "@/lib/database/models/vendor.model";
import { cookies } from "next/headers";
const bcrypt = require("bcrypt");

export const registerVendor = async (
  name: string,
  email: string,
  password: string,
  address: string,
  phoneNumber: string,
  zipCode: string,
  howdoyouhearaboutus: string,
  country: string
) => {
  try {
    await connectToDatabase();

    if (!name || !email || !password || !address || !phoneNumber || !zipCode || !howdoyouhearaboutus || !country) {
      return { message: "Please fill in all fields", success: false };
    }

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return { message: "Vendor already exists.", success: false };
    }

    if (password.length < 6) {
      return { message: "Password must be at least 6 characters long.", success: false };
    }

    const cryptedPassword = await bcrypt.hash(password, 12);
    const vendor = await new Vendor({
      name,
      email,
      password: cryptedPassword,
      address,
      phoneNumber,
      zipCode,
      howdoyouhearaboutus,
      country,
    }).save();

    const token = vendor.getJWTToken();
    const cookieStore = await cookies();

    // 🔹 Short-lived cookie (2 hours)
    cookieStore.set("vendor_token", token, {
      maxAge: 2 * 60 * 60, // 2 hours in seconds
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return {
      message: "Successfully registered new vendor.",
      vendor: JSON.parse(JSON.stringify(vendor)),
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return { message: "An error occurred during registration.", success: false };
  }
};
