"use server";
 
import { createSupabaseServerClient } from "@/config/supabase-server-config";
import { IUser } from "@/interfaces";

export const registerUser = async (payload: Partial<IUser>) => {
  const supabase = await createSupabaseServerClient();

  // store authentication details in supabase auth
  const authTableResponse = await supabase.auth.signUp({
    email: payload.email!,
    password: payload.password!,
    phone:payload.phone!
    
    
  });
  if (authTableResponse.error) {
    return { success: false, message: authTableResponse.error.message };
  }

  // store additional user details in user_profiles table
  const userProfilesTableResponse = await supabase
    .from("car_rental_users")
    .insert([
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role || "user",
        status: "active",
      },
    ]);

  if (userProfilesTableResponse.error) {
    return { success: false, message: userProfilesTableResponse.error.message };
  }

  return { success: true, message: "User registered successfully" };
};

export const loginUser = async (payload: {
  email: string;
  password: string;
  role: string;
}) => {
  const supabase = await createSupabaseServerClient();

  // authenticate user with supabase auth
  const authResponse = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (authResponse.error) {
    return { success: false, message: authResponse.error.message };
  }

  const email = authResponse.data.user?.email;

  // check if role matches with user_profiles table
  const userProfilesTableResponse = await supabase
    .from("car_rental_users")
    .select("*")
    .eq("email", email)
    .single();
  if (userProfilesTableResponse.error) {
    return { success: false, message: userProfilesTableResponse.error.message };
  }

  if (userProfilesTableResponse.data.role !== payload.role) {
    return { success: false, message: "Role does not match" };
  }

  // prevent inactive users from remaining signed in
  if (userProfilesTableResponse.data.status !== "active") {
    // clear any auth session created by signInWithPassword
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Your account is inactive. Please contact the administrator to activate your account.",
    };
  }

  // return appropriate response

  return {
    success: true,
    message: "User logged in successfully",
    data: userProfilesTableResponse.data,
  };
};

export const getLoggedInUser = async () => {
  try {
    const supabase = await createSupabaseServerClient();
    const authResponse = await supabase.auth.getUser();
    if (authResponse.error || !authResponse.data.user) {
      return null;
    }
    const email = authResponse.data.user.email;

    const userProfilesTableResponse = await supabase
      .from("car_rental_users")
      .select("*")
      .eq("email", email)
      .single();
    if (userProfilesTableResponse.error) {
      return null;
    }

    return { success: true, data: userProfilesTableResponse.data };
  } catch (error) {
    return { success: false, message: "Failed to fetch logged in user" };
  }
};

export const logoutUser = async () => {
  const supabase = await createSupabaseServerClient();
  const signOutResponse = await supabase.auth.signOut();

  if (signOutResponse.error) {
    return { success: false, message: signOutResponse.error.message };
  }

  return { success: true, message: "User logged out successfully" };
};

export const getAllUsers = async () => {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("car_rental_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: "Failed to fetch users" };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { error: bookingError } = await supabase
      .from("car_rental_bookings")
      .delete()
      .eq("user_id", userId);

    if (bookingError) {
      return { success: false, message: bookingError.message };
    }

    const { error } = await supabase
      .from("car_rental_users")
      .delete()
      .eq("id", userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to delete user" };
  }
};
export const updatePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const supabase = await createSupabaseServerClient();
    const authResponse = await supabase.auth.getUser();

    if (authResponse.error || !authResponse.data.user) {
      return { success: false, message: "User is not authenticated." };
    }

    const email = authResponse.data.user.email;
    if (!email) {
      return { success: false, message: "Unable to determine user email." };
    }

    // Verify the old password before updating to a new one.
    const reauthResponse = await supabase.auth.signInWithPassword({
      email,
      password: payload.oldPassword,
    });

    if (reauthResponse.error) {
      return { success: false, message: "Old password is incorrect." };
    }

    const updateResponse = await supabase.auth.updateUser({
      password: payload.newPassword,
    });

    if (updateResponse.error) {
      return { success: false, message: updateResponse.error.message };
    }

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update password." };
  }
};

export const deactivateCurrentUser = async () => {
  try {
    const supabase = await createSupabaseServerClient();
    const authResponse = await supabase.auth.getUser();

    if (authResponse.error || !authResponse.data.user) {
      return { success: false, message: "User is not authenticated." };
    }

    const email = authResponse.data.user.email;
    if (!email) {
      return { success: false, message: "Unable to determine user email." };
    }

    const updateResponse = await supabase
      .from("car_rental_users")
      .update({ status: "inactive" })
      .eq("email", email);

    if (updateResponse.error) {
      return { success: false, message: updateResponse.error.message };
    }

    const signOutResponse = await supabase.auth.signOut();
    if (signOutResponse.error) {
      return {
        success: false,
        message: "Account deactivated, but failed to sign out. Please sign out manually.",
      };
    }

    return { success: true, message: "Account deactivated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to deactivate account." };
  }
};

export const updateUserRole = async (
  userId: string,
  role: "user" | "admin",
) => {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("car_rental_users")
      .update({ role })
      .eq("id", userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "User role updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to update user role" };
  }
};

export const updateUserStatus = async (
  userId: string,
  status: "active" | "inactive",
) => {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("car_rental_users")
      .update({ status })
      .eq("id", userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "User status updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to update user status" };
  }
};