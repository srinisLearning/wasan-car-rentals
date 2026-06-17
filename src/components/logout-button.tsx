"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/server-actions/users";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);

    const response = await logoutUser();
    if (response.success) {
      router.push("/login");
    } else {
      console.error("Logout failed:", response.message);
    }

    setIsLoading(false);
  };

  return (
    <Button onClick={handleLogout} disabled={isLoading} className="mt-10">
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}