import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IUser } from "@/interfaces";
import {
  LayoutDashboard,
  Car,
  Calendar,
  User,
  Settings,
  Users,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

interface MenuItemsProps {
  openMenuItems: boolean;
  setOpenMenuItems: (open: boolean) => void;
  currentUser: IUser;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

function MenuItems({
  openMenuItems,
  setOpenMenuItems,
  currentUser,
}: MenuItemsProps) {
  const pathname = usePathname();

  const menuItems: MenuItem[] =
    currentUser.role === "user"
      ? [
          {
            name: "Dashboard",
            path: "/user/dashboard",
            icon: <LayoutDashboard size={20} />,
          },
          {
            name: "Cars",
            path: "/user/cars",
            icon: <Car size={20} />,
          },
          {
            name: "Bookings",
            path: "/user/bookings",
            icon: <Calendar size={20} />,
          },
          {
            name: "Profile",
            path: "/user/profile",
            icon: <User size={20} />,
          },
          {
            name: "Settings",
            path: "/user/settings",
            icon: <Settings size={20} />,
          },
        ]
      : [
          {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: <LayoutDashboard size={20} />,
          },
          {
            name: "Cars",
            path: "/admin/cars",
            icon: <Car size={20} />,
          },
          {
            name: "Users",
            path: "/admin/users",
            icon: <Users size={20} />,
          },
          {
            name: "Bookings",
            path: "/admin/bookings",
            icon: <Calendar size={20} />,
          },
          {
            name: "Settings",
            path: "/admin/settings",
            icon: <Settings size={20} />,
          },
        ];

  return (
    <Sheet open={openMenuItems} onOpenChange={setOpenMenuItems}>
      <SheetContent className="px-8 pt-20">
        <SheetHeader>
          <SheetTitle><p>Wasan Car Rentals</p></SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setOpenMenuItems(false)}
              >
                <div
                  className={`flex items-center gap-5 p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}

          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MenuItems;
