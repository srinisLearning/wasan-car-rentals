"use server";
import { createSupabaseServerClient } from "@/config/supabase-server-config";
import { IBooking } from "@/interfaces";
import dayjs from "dayjs";
import { sendEmail } from "@/server-actions/mails";
import { getBookingStatusChangeTemplate } from "@/constants/email-template";

export const checkCarAvailability = async ({
  carId,
  startDate,
  endDate,
}: {
  carId: string;
  startDate: string;
  endDate: string;
}) => {
  try {
    const datesArray = [];
    let currentDate = dayjs(startDate);
    const lastDate = dayjs(endDate);

    while (currentDate.isBefore(lastDate) || currentDate.isSame(lastDate)) {
      datesArray.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    const supabase = await createSupabaseServerClient();

    const { data: existingBookings, error } = await supabase
      .from("car_rental_bookings")
      .select("id, booked_dates")
      .eq("car_id", carId)
      .overlaps("booked_dates", datesArray);

    if (error) {
      console.error("Error checking bookings:", error);
      return { success: false, message: "Error checking availability" };
    }

    if (existingBookings && existingBookings.length > 0) {
      return { success: true, available: false };
    }

    return { success: true, available: true };
  } catch (error) {
    return { success: false, message: "Failed to check availability" };
  }
};

export const createBooking = async (bookingData: {
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentId: string;
}) => {
  try {
    const datesArray = [];
    let currentDate = dayjs(bookingData.startDate);
    const lastDate = dayjs(bookingData.endDate);

    while (currentDate.isBefore(lastDate) || currentDate.isSame(lastDate)) {
      datesArray.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("car_rental_bookings")
      .insert([
        {
          user_id: bookingData.userId,
          car_id: bookingData.carId,
          start_date: bookingData.startDate,
          end_date: bookingData.endDate,
          booked_dates: datesArray,
          total_amount: bookingData.totalAmount,
          payment_id: bookingData.paymentId,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      console.error("Error creating booking:", error);
      return { success: false, message: "Failed to create booking" };
    }

    return {
      success: true,
      message: "Booking created successfully",
      data: data?.[0],
    };
  } catch (error) {
    console.error("Error in createBooking:", error);
    return { success: false, message: "Failed to create booking" };
  }
};

export const fetchUserBookings = async (userId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("car_rental_bookings")
      .select("*, cars:car_id(name, company, variant, rent_per_day, images)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return { success: false, message: "Failed to fetch bookings" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in fetchUserBookings:", error);
    return { success: false, message: "Failed to fetch bookings" };
  }
};

export const cancelBooking = async (bookingId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("car_rental_bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .select();

    if (error) {
      console.error("Error cancelling booking:", error);
      return { success: false, message: "Failed to cancel booking" };
    }

    return { success: true, message: "Booking cancelled successfully", data };
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    return { success: false, message: "Failed to cancel booking" };
  }
};

export const fetchAllBookings = async () => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("car_rental_bookings")
      .select(
        "*, cars:car_id(name, company, variant, rent_per_day, images), users:user_id(name, email)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return { success: false, message: "Failed to fetch bookings" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in fetchAllBookings:", error);
    return { success: false, message: "Failed to fetch bookings" };
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  status: "pending" | "confirmed" | "cancelled" | "completed",
) => {
  try {
    const supabase = await createSupabaseServerClient();

    // Fetch booking with user details
    const { data: bookingData, error: fetchError } = await supabase
      .from("car_rental_bookings")
      .select("*, users:user_id(name, email)")
      .eq("id", bookingId)
      .single();

    if (fetchError || !bookingData) {
      console.error("Error fetching booking:", fetchError);
      return { success: false, message: "Failed to fetch booking details" };
    }

    // Update booking status
    const { data, error } = await supabase
      .from("car_rental_bookings")
      .update({ status })
      .eq("id", bookingId)
      .select();

    if (error) {
      console.error("Error updating booking status:", error);
      return { success: false, message: "Failed to update booking status" };
    }

    // Generate email template
    const emailTemplate = getBookingStatusChangeTemplate({
      booking: bookingData,
      newStatus: status,
    });

    if (emailTemplate.success) {
      // Send email to customer
      const emailResponse: any = await sendEmail(
        bookingData.users.email,
        `Booking Status Updated - ${status.toUpperCase()}`,
        emailTemplate.html!,
      );

      if (!emailResponse.success) {
        console.error("Email sending failed but booking status updated");
      }
    }

    return {
      success: true,
      message: "Booking status updated successfully",
      data,
    };
  } catch (error) {
    console.error("Error in updateBookingStatus:", error);
    return { success: false, message: "Failed to update booking status" };
  }
};
