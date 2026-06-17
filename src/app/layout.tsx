import type { Metadata } from "next";
import {Comfortaa, Geist, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import CustomLayout from "@/custom-layout";

const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400"], // pick what you actually use
  display: "swap",
    // optional: set a custom transformation for the font
  variable: "--font-comfortaa", // optional: exposes a CSS variable
});

export const metadata: Metadata = {
  title: "Wasan Car Rentals",
  description: "An app to rent cars in Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("", "font-sans", geist.variable, robotoHeading.variable)}
    >
      <body className={comfortaa.className}>
        <CustomLayout>{children}</CustomLayout>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
