"use client";
import React, { useEffect } from "react";
import Header from "./header";
import { useUsersStore } from "@/store/users-store";
import { getLoggedInUser } from "@/server-actions/users";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {Spinner} from "@/components/ui/spinner";

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { setCurrentUser, setLoading, loading } = useUsersStore();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await getLoggedInUser();
        if (response?.success && response?.data) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        toast.error("Failed to fetch user data. Please log in again.");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setCurrentUser, setLoading]);

  if (loading) {
    return (
      <div className="h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="px-10 py-5">{children}</main>
    </div>
  );
}

export default PrivateLayout;
