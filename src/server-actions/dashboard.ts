"use server";
import { createSupabaseServerClient } from "@/config/supabase-server-config";

export const getAdminDashboardStats = async () => {
  try {
    const supabase = await createSupabaseServerClient();

    // Fetch total cars
    const { data: carsData, error: carsError } = await supabase
      .from("car_rental_cars")
      .select("id", { count: "exact" });

    if (carsError) {
      console.error("Error fetching cars:", carsError);
      return { success: false, message: "Failed to fetch cars count" };
    }

    const totalCars = carsData?.length || 0;

    // Fetch total users
    const { data: usersData, error: usersError } = await supabase
      .from("car_rental_users")
      .select("id", { count: "exact" });

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return { success: false, message: "Failed to fetch users count" };
    }

    const totalUsers = usersData?.length || 0;

    // Fetch total bookings and total revenue
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("car_rental_bookings")
      .select("id, total_amount");

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return { success: false, message: "Failed to fetch bookings" };
    }

    const totalBookings = bookingsData?.length || 0;
    const totalRevenue =
      bookingsData?.reduce(
        (sum, booking) => sum + (booking.total_amount || 0),
        0,
      ) || 0;

    // Fetch last 5 bookings with car and user details
    const { data: last5Bookings, error: last5BookingsError } = await supabase
      .from("car_rental_bookings")
      .select(
        "id, status, total_amount, start_date, end_date, cars:car_id(name, company), users:user_id(name, email)",
      )
      .order("created_at", { ascending: false })
      .limit(5);

    if (last5BookingsError) {
      console.error("Error fetching last 5 bookings:", last5BookingsError);
      return {
        success: false,
        message: "Failed to fetch last 5 bookings",
      };
    }

    return {
      success: true,
      data: {
        totalCars,
        totalBookings,
        totalUsers,
        totalRevenue,
        last5Bookings: last5Bookings || [],
      },
    };
  } catch (error) {
    console.error("Error in getAdminDashboardStats:", error);
    return { success: false, message: "Failed to fetch dashboard stats" };
  }
};

export const getUserDashboardStats = async (userId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    // Fetch user's total bookings and total amount spent
    const { data: userBookingsData, error: userBookingsError } = await supabase
      .from("car_rental_bookings")
      .select("id, total_amount, status")
      .eq("user_id", userId);

    if (userBookingsError) {
      console.error("Error fetching user bookings:", userBookingsError);
      return { success: false, message: "Failed to fetch bookings" };
    }

    const totalBookings = userBookingsData?.length || 0;
    const totalAmountSpent =
      userBookingsData?.reduce(
        (sum, booking) => sum + (booking.total_amount || 0),
        0,
      ) || 0;

    // Count confirmed bookings
    const confirmedBookings =
      userBookingsData?.filter((b) => b.status === "confirmed").length || 0;

    // Fetch user's last 5 bookings with car details
    const { data: last5Bookings, error: last5BookingsError } = await supabase
      .from("car_rental_bookings")
      .select(
        "id, status, total_amount, start_date, end_date,  cars:car_id(name, company, variant, images)",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (last5BookingsError) {
      console.error("Error fetching user last 5 bookings:", last5BookingsError);
      return {
        success: false,
        message: "Failed to fetch recent bookings",
      };
    }

    return {
      success: true,
      data: {
        totalBookings,
        totalAmountSpent,
        confirmedBookings,
        last5Bookings: last5Bookings || [],
      },
    };
  } catch (error) {
    console.error("Error in getUserDashboardStats:", error);
    return { success: false, message: "Failed to fetch dashboard stats" };
  }
};