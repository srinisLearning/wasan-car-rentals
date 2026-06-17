"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deactivateCurrentUser, updatePassword } from "@/server-actions/users";

const schema = z
  .object({
    oldPassword: z.string().min(6, {
      message: "Please enter your current password.",
    }),
    newPassword: z.string().min(6, {
      message: "New password must be at least 6 characters.",
    }),
    confirmNewPassword: z.string().min(6, {
      message: "Please confirm your new password.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "New passwords do not match.",
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password.",
  });

type FormValues = z.infer<typeof schema>;

const UserSettingsPage = () => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  const [loading, setLoading] = React.useState(false);
  const [deactivating, setDeactivating] = React.useState(false);

  async function onSubmit(values: FormValues) {
    setLoading(true);

    const response = await updatePassword({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });

    if (response.success) {
      toast.success(response.message || "Password updated successfully.");
      form.reset();
      router.push("/login");
    } else {
      toast.error(response.message || "Failed to update password. Please try again.");
    }

    setLoading(false);
  }

  async function handleDeactivate() {
    setDeactivating(true);

    const response = await deactivateCurrentUser();
    if (response.success) {
      toast.success(response.message || "Account deactivated successfully.");
      router.push("/login");
    } else {
      toast.error(response.message || "Failed to deactivate account. Please try again.");
    }

    setDeactivating(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
          <div className="rounded-xl bg-white p-8 shadow-md">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Update Password</h1>
            <p className="text-sm text-gray-600 mb-6">
              Enter your current password and choose a new password to update your account credentials.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading || deactivating}>
                  {loading ? "Updating password..." : "Update Password"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Deactivate Account</h2>
              <p className="text-sm text-gray-600 mb-6">
                Deactivating your account will set your status to inactive and sign you out immediately.
              </p>
            </div>

            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={handleDeactivate}
              disabled={loading || deactivating}
            >
              {deactivating ? "Deactivating..." : "Deactivate Account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;