import { UsersState, useUsersStore } from "@/store/users-store";
import { Menu } from "lucide-react";
import React, { useState } from "react";
import MenuItems from "./menu-items";

function Header() {
  const { currentUser } = useUsersStore() as UsersState;
  const [openMenuItems, setOpenMenuItems] = useState(false);

  return (
    <>
      <div className="bg-primary flex justify-between px-10 py-6 items-center">
        <h1 className="text-2xl text-white font-bold">Wasan Car Rentals</h1>

        <p className="text-lg text-white">
        {currentUser?.role.toUpperCase() === "ADMIN" ? "ADMIN" : currentUser?.name.toLocaleUpperCase()}         
          &nbsp;&nbsp;DASHBOARD
          
          </p>

        {currentUser && (
          <div className="flex gap-5 items-center">
            <h1 className="text-sm text-white">
             {/*  {currentUser.name}  */}
            </h1>

            <Menu
              className="text-white cursor-pointer"
              size={16}
              onClick={() => setOpenMenuItems(true)}
            />
          </div>
        )}
      </div>

      {currentUser && (
        <MenuItems
          openMenuItems={openMenuItems}
          setOpenMenuItems={setOpenMenuItems}
          currentUser={currentUser}
        />
      )}
    </>
  );
}

export default Header;
