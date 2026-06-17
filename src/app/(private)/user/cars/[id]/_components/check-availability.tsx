import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkCarAvailability, createBooking } from "@/server-actions/bookings";
import { createPaymentIntent } from "@/server-actions/payments";
import { AlertCircle, CheckCircle } from "lucide-react";
import { ICar } from "@/interfaces";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import CheckoutForm from "./checkout-form";
import { useUsersStore } from "@/store/users-store";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface CheckAvailabilityProps {
  carId?: string;
  car?: ICar;
}

export function CheckAvailability({
  carId: propCarId,
  car,
}: CheckAvailabilityProps) {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useUsersStore();
  const carId = propCarId || (params.id as string);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    status: "idle" | "available" | "unavailable";
    message: string;
  }>({ status: "idle", message: "" });
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (!startDate || !endDate || !car) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * car.rent_per_day;
  }, [startDate, endDate, car]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get minimum end date (day after start date)
  const getMinEndDate = () => {
    if (!startDate) return getTodayDate();
    const start = new Date(startDate);
    const nextDay = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return nextDay.toISOString().split("T")[0];
  };

  const handleCheckAvailability = async () => {
    // Validation 1: Check if both dates are selected
    if (!startDate || !endDate) {
      setAvailabilityStatus({
        status: "unavailable",
        message: "Please select both start and end dates",
      });
      return;
    }

    // Validation 2: Check if end date is after start date
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (startDateObj >= endDateObj) {
      setAvailabilityStatus({
        status: "unavailable",
        message: "End date must be after start date",
      });
      return;
    }

    // Validation 3: Check if start date is not in the past
    const today = new Date(getTodayDate());
    if (startDateObj < today) {
      setAvailabilityStatus({
        status: "unavailable",
        message: "Start date cannot be in the past",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await checkCarAvailability({
        carId,
        startDate,
        endDate,
      });

      if (response.success && response.available) {
        setAvailabilityStatus({
          status: "available",
          message: "Great! This slot is available for booking",
        });
      } else {
        setAvailabilityStatus({
          status: "unavailable",
          message:
            "Sorry, this car is not available for the selected dates. Please try different dates.",
        });
      }
    } catch (error) {
      setAvailabilityStatus({
        status: "unavailable",
        message: "Failed to check availability. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setStartDate("");
    setEndDate("");
    setAvailabilityStatus({ status: "idle", message: "" });
    setClientSecret(null);
  };

  const handleMakePayment = async () => {
    if (!totalAmount || totalAmount <= 0) {
      console.error("Invalid amount for payment");
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await createPaymentIntent(totalAmount);
      if (response.success && response.clientSecret) {
        setClientSecret(response.clientSecret);
        setOpenPaymentModal(true);
      } else {
        toast.error(
          response.message ||
            "Failed to create payment intent. Please try again.",
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const onSuccess = async (paymentId: string) => {
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }

    setBookingLoading(true);
    try {
      const bookingResponse = await createBooking({
        userId: currentUser.id,
        carId,
        startDate,
        endDate,
        totalAmount,
        paymentId,
      });

      if (bookingResponse.success) {
        setBookingSuccess(true);
        setBookingMessage("Booking created successfully!");
        toast.success(bookingResponse.message);

        // Navigate to bookings page after 2 seconds
        setTimeout(() => {
          router.push("/user/bookings");
        }, 2000);
      } else {
        toast.error(bookingResponse.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("An error occurred while creating booking");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              // Reset end date if it becomes invalid
              if (endDate && new Date(e.target.value) >= new Date(endDate)) {
                setEndDate("");
              }
            }}
            className="text-sm"
            disabled={loading || availabilityStatus.status === "available"}
            min={getTodayDate()}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm"
            disabled={
              loading || !startDate || availabilityStatus.status === "available"
            }
            min={getMinEndDate()}
          />
        </div>
      </div>
      {availabilityStatus.status !== "available" && (
        <Button
          onClick={handleCheckAvailability}
          className="w-full py-2 text-sm"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Availability"}
        </Button>
      )}

      {/* Status Messages and Actions */}
      {availabilityStatus.status === "available" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">
              {availabilityStatus.message}
            </p>
          </div>

          {/* Total Amount */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Total Amount
              </span>
              <span className="text-lg font-bold text-primary">
                ${totalAmount}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {startDate && endDate && (
                <>
                  {Math.ceil(
                    (new Date(endDate).getTime() -
                      new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days × ${car?.rent_per_day}/day
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleMakePayment}
              disabled={paymentLoading}
              className="flex-1 py-2 text-sm"
            >
              {paymentLoading ? "Processing..." : "Make Payment"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearSelection}
              className="flex-1 py-2 text-sm"
              disabled={paymentLoading}
            >
              Clear Selection
            </Button>
          </div>

          {/* Client Secret Display */}
          {clientSecret && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Payment Intent Created
              </p>
              <p className="text-xs text-gray-600 break-all">
                Client Secret: {clientSecret}
              </p>
            </div>
          )}
        </div>
      )}

      {availabilityStatus.status === "unavailable" && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{availabilityStatus.message}</p>
        </div>
      )}

      {/* Booking Success Message */}
      {bookingSuccess && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">
            {bookingMessage}. Redirecting to bookings...
          </p>
        </div>
      )}

      {clientSecret && openPaymentModal && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: clientSecret,
          }}
        >
          <CheckoutForm
            onSuccess={onSuccess}
            openCheckoutModal={openPaymentModal}
            setOpenCheckoutModal={setOpenPaymentModal}
            clientSecret={clientSecret}
          />
        </Elements>
      )}
    </div>
  );
}

export default CheckAvailability;
