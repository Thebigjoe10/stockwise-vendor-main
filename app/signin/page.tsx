"use client";
import React, { useState } from "react";
import {
  Button,
  NumberInput,
  PasswordInput,
  Textarea,
  TextInput,
  Notification,
  LoadingOverlay,
  Box,
} from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { loginVendor } from "@/lib/database/actions/vendor/auth/login";

const SignInPage = () => {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: isEmail("Invalid Email."),
      password: hasLength(
        { min: 10 },
        "Password must be at least 10 characters long."
      ),
    },
  });
  const [successMessage, setSuccessMessage] = useState(false);
  const [failureMessage, setFailureMessage] = useState<{
    visible: boolean;
    message: string | undefined;
  }>({ visible: false, message: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      await loginVendor(values.email, values.password)
        .then((res) => {
          if (res?.success) {
            setSuccessMessage(true);
            setFailureMessage({ visible: false, message: "" });
            setTimeout(() => {
              router.push("/vendor/dashboard");
            }, 3000);
          } else if (!res?.success) {
            setSuccessMessage(false);
            setFailureMessage({ visible: true, message: res?.message });
          }
        })
        .catch((err) => {
          setFailureMessage({ visible: true, message: err.toString() });
        });
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <div className="hidden md:flex w-1/2 justify-center">
          <img
            src="/images/vendor-illustration.png"
            alt="Vendor illustration"
            className="max-w-md"
          />
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-4 text-brand">
              Sign In as a Vendor
            </h1>

            {/* Notifications */}
            {failureMessage.visible && (
              <Notification
                color="red"
                title="Error!"
                mt="md"
                onClose={() => setFailureMessage({ visible: false, message: "" })}
              >
                {failureMessage.message}
              </Notification>
            )}

            {successMessage && (
              <Notification
                color="teal"
                title="Login Successful"
                mt="md"
                onClose={() => setSuccessMessage(false)}
              >
                Redirecting you to dashboard...
              </Notification>
            )}

            {/* Form */}
            <Box pos="relative" mt="md">
              {loading && <LoadingOverlay visible overlayProps={{ radius: "sm", blur: 2 }} />}

              <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                <TextInput
                  {...form.getInputProps("email")}
                  label="Email"
                  placeholder="Email"
                  required
                />
                <PasswordInput
                  {...form.getInputProps("password")}
                  label="Password"
                  placeholder="Password"
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {loading ? "Loading..." : "Sign In"}
                </Button>

                <div className="text-center mt-4 text-sm text-gray-500">
                  Don’t have an account?{" "}
                  <a href="/signup" className="text-green-600 hover:underline">
                    Sign up
                  </a>
                </div>
              </form>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
