import { IBooking } from "@/interfaces";

export const getBookingStatusChangeTemplate = ({
  booking,
  newStatus,
}: {
  booking: IBooking;
  newStatus: string;
}) => {
  try {
    const conformationHtml = `
      <h1>Booking Status Updated</h1>
      <p>Dear Customer,</p>
      <p>Your booking with ID: <strong>${booking.id}</strong> has been updated to the status: <strong>${newStatus}</strong>.</p>
      <p>Booking Details:</p>
      <ul>
        <li>Car ID: ${booking.car_id}</li>
        <li>Start Date: ${booking.start_date}</li>
        <li>End Date: ${booking.end_date}</li>
        <li>Total Amount: $${booking.total_amount}</li>
      </ul>
      <p>Thank you for choosing NextCarRentalAI!</p>
    `;

    const cancellationHtml = `
      <h1>Booking Cancelled</h1>
      <p>Dear Customer,</p>
      <p>Your booking with ID: <strong>${booking.id}</strong> has been cancelled as per your request.</p>
      <p>We hope to serve you again in the future.</p>
      <p>Thank you for choosing NextCarRentalAI!</p>
    `;

    if (newStatus === "cancelled") {
      return { success: true, html: cancellationHtml };
    } else {
      return { success: true, html: conformationHtml };
    }
  } catch (error) {
    return { success: false, message: "Failed to generate email template" };
  }
};