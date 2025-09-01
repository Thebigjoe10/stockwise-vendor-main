"use client";
import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/database/actions/vendor/auth/logout";
import { useEffect, useState } from "react";
import { getVendorCookiesandFetchVendor } from "@/lib/database/actions/vendor/vendor.actions";
import React from "react";
import Logo from "./Logo";

const Navbar = () => {
  const [vendor, setVendor] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const res = await getVendorCookiesandFetchVendor();
        if (res?.success) {
          setVendor(res?.vendor);
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    fetchVendorDetails();
  }, []);

  return (
    <header className="p-4 border-b border-[#eaeaea]">
      <nav className="flex flex-wrap justify-between items-center">
        {/* Left side: Logo */}
        <div className="mb-2 sm:mb-0">
          <Logo />
        </div>

        {/* Right side: Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          {vendor && vendor.name ? (
            <>
              <Button
                variant="outline"
                fullWidth
                className="sm:w-auto"
                onClick={() => router.push("/vendor/dashboard")}
              >
                Vendor Dashboard
              </Button>
              <Button
                fullWidth
                className="sm:w-auto"
                onClick={() => {
                  logout();
                  router.refresh();
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                fullWidth
                className="sm:w-auto"
                onClick={() => router.push("/signin")}
              >
                Sign In
              </Button>
              <Button
                fullWidth
                className="sm:w-auto"
                onClick={() => router.push("/signup")}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
