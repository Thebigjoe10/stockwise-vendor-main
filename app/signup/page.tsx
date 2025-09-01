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
  Select,
  Stepper,
} from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { registerVendor } from "@/lib/database/actions/vendor/auth/register";

const SignUpPage = () => {
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      description: "",
      address: "",
      phoneNumber: "",
      zipCode: "",
      howdoyouhearaboutus: "",
      country: ""
    },
    validate: {
      name: hasLength({ min: 8 }, "Must be at least 8 characters long."),
      email: isEmail("Invalid Email."),
      password: hasLength(
        { min: 10 },
        "Password must be at least 10 characters long."
      ),
      address: hasLength({ min: 15 }, "Must be at least 15 characters long."),
      phoneNumber: hasLength(
        { min: 11, max: 14 },
        "Invalid phone number."
      ),
      zipCode: hasLength({ min: 5 }, "Invalid zip code."),

    },
  });
  const [successMessage, setSuccessMessage] = useState(false);
  const [failureMessage, setFailureMessage] = useState<{
    visible: boolean;
    message: string | undefined;
  }>({ visible: false, message: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
   // ---- Stepper state ----
  const [active, setActive] = useState(0);
  const totalSteps = 5;

  const stepFields: string[][] = [
    ["email", "password"], // Step 0
    ["name", "phoneNumber"], // Step 1
    ["address", "country", "zipCode"], // Step 2
    ["description", "howdoyouhearaboutus"], // Step 3
  ];

  const validateCurrentStep = () => {
    const fields = stepFields[active] || [];
    // validate each field in the current step
    const results = fields.map((field) => form.validateField(field as any));
    const hasErrors = results.some((r: any) => r?.hasError);
    return !hasErrors;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActive((s) => Math.min(s + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setActive((s) => Math.max(s - 1, 0));
  };
  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      await registerVendor(
        values.name,
        values.email,
        values.password,
        values.address,
        values.phoneNumber,
        values.zipCode,
        values.howdoyouhearaboutus,
        values.country
      )
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
        {/* Left illustration - hidden on mobile */}
        <div className="hidden md:flex w-1/2 justify-center">
          <img
            src="/images/vendor-illustration.png"
            alt="Vendor illustration"
            className="max-w-md"
          />
        </div>

        {/* Right form */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-4 text-brand">
              Sign Up as a Vendor
            </h1>

            {/* Progress indicator (Mantine Stepper as dots) */}
            <Stepper
              active={active}
              onStepClick={setActive}
              allowNextStepsSelect={false}
              size="xs"
              color="blue"
              className="mb-6"
              styles={{
                stepBody: { display: "none" }, // hide labels for dot-only look
                stepIcon: { borderWidth: 2 },   // thicker ring
              }}
            >
              <Stepper.Step label="Account"/>
              <Stepper.Step label="Identity / Contact"/>
              <Stepper.Step label="Address"/>
              <Stepper.Step label="Extras"/>
            </Stepper>

            {/* Notifications */}
            {failureMessage.visible && (
              <Notification
                color="red"
                title="Error!"
                mt="md"
                onClose={() =>
                  setFailureMessage({ visible: false, message: "" })
                }
              >
                {failureMessage.message}
              </Notification>
            )}

            {successMessage && (
              <Notification
                color="teal"
                title="Successfully registered"
                mt="md"
                onClose={() => setSuccessMessage(false)}
              >
                Redirecting you to dashboard...
              </Notification>
            )}

            {/* Form */}
            <Box pos="relative" mt="md">
              {loading && (
                <LoadingOverlay
                  visible={loading}
                  zIndex={1000}
                  overlayProps={{ radius: "sm", blur: 2 }}
                />
              )}

              <form
                onSubmit={form.onSubmit(handleSubmit)}
                className="space-y-4"
              >
                {/* Step 0: Account */}
                {active === 0 && (
                  <>
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
                  </>
                )}

                {/* Step 1: Identity / Contact */}
                {active === 1 && (
                  <>
                    <TextInput
                      {...form.getInputProps("name")}
                      label="Store Name"
                      placeholder="Store Name"
                      required
                    />
                    <TextInput
                      {...form.getInputProps("phoneNumber")}
                      label="Phone Number"
                      placeholder="Phone Number"
                      required
                    />
                  </>
                )}

                {/* Step 2: Address */}
                {active === 2 && (
                  <>
                    <Textarea
                      {...form.getInputProps("address")}
                      placeholder="Address"
                      label="Address"
                      required
                    />
                    <Select
                      {...form.getInputProps("country")}
                      label="Country"
                      placeholder="Select country"
                      required
                      data={[
                        { value: "NG", label: "Nigeria" },
                        { value: "US", label: "United States" },
                        { value: "GB", label: "United Kingdom" },
                        { value: "EU", label: "European Union" },
                        { value: "KE", label: "Kenya" },
                        { value: "GH", label: "Ghana" },
                      ]}
                    />
                    <TextInput
                      {...form.getInputProps("zipCode")}
                      label="Zip Code"
                      placeholder="Zip Code"
                      required
                    />
                  </>
                )}

                {/* Step 3: Extras */}
                {active === 3 && (
                  <>
                    <Textarea
                      {...form.getInputProps("description")}
                      placeholder="Write a brief description of your store..."
                      label="Description"
                    />
                    <Select
                      {...form.getInputProps("howdoyouhearaboutus")}
                      label="How did you hear about us?"
                      placeholder="Select an option"
                      data={[
                        { value: "friend", label: "Friend / Referral" },
                        { value: "social", label: "Social Media" },
                        { value: "ads", label: "Online Ads" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </>
                )}

                {/* Step controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={active === 0}
                  >
                    Back
                  </Button>

                  {active < totalSteps - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      {loading ? "Loading..." : "Sign Up"}
                    </Button>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center mt-4 text-sm text-gray-500">
                  Already have an account?{" "}
                  <a href="/signin" className="text-green-600 hover:underline">
                    Sign in
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

export default SignUpPage;
