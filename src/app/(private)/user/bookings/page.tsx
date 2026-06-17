"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { fetchUserBookings, cancelBooking } from "@/server-actions/bookings";
import { IBooking } from "@/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useUsersStore } from "@/store/users-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import dayjs from "dayjs";

interface BookingWithCar extends IBooking {
  cars: {
    name: string;
    company: string;
    variant: string;
    rent_per_day: number;
    images: string[];
  };
}

export default function UserBookings() {
  const { currentUser } = useUsersStore();
  const [bookings, setBookings] = useState<BookingWithCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Fetch bookings on mount
  useEffect(() => {
    if (currentUser?.id) {
      loadBookings();
    }
  }, [currentUser?.id]);

  const loadBookings = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    setError(null);
    const response: any = await fetchUserBookings(currentUser.id);
    if (response.success) {
      setBookings(response.data || []);
    } else {
      setError(response.message);
      toast.error(response.message);
    }
    setLoading(false);
  };

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    setCancelling(true);
    const response = await cancelBooking(bookingToCancel);

    if (response.success) {
      toast.success(response.message);
      await loadBookings();
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    } else {
      toast.error(response.message);
    }
    setCancelling(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isCancellable = (booking: BookingWithCar) => {
    return booking.status === "pending" || booking.status === "confirmed";
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">My Bookings</h1>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={loadBookings}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="h-96">
          <Spinner />
        </div>
      )}

      {/* No Bookings State */}
      {!loading && bookings.length === 0 && !error && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by exploring and booking your favorite cars.
            </p>
            <Button onClick={() => (window.location.href = "/user/cars")}>
              Browse Cars
            </Button>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && bookings.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow className="hover:bg-gray-100">
                <TableHead className="h-12 py-3">Car Details</TableHead>
                <TableHead className="h-12 py-3">Start Date</TableHead>
                <TableHead className="h-12 py-3">End Date</TableHead>
                <TableHead className="h-12 py-3">Days</TableHead>
                <TableHead className="h-12 py-3">Total Amount</TableHead>
                <TableHead className="h-12 py-3">Status</TableHead>
                <TableHead className="h-12 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{booking.cars?.name}</p>
                      <p className="text-sm text-gray-500">
                        {booking.cars?.company?.toUpperCase()} -{" "}
                        {booking.cars?.variant?.toUpperCase()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {dayjs(booking.start_date).format("MMM DD YYYY")}
                  </TableCell>
                  <TableCell>
                    {dayjs(booking.end_date).format("MMM DD YYYY")}
                  </TableCell>
                  <TableCell>{booking.booked_dates.length} days</TableCell>
                  <TableCell className="font-medium">
                    ${booking.total_amount}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status,
                      )}`}
                    >
                      {booking.status?.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {isCancellable(booking) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelClick(booking.id)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleCancelConfirm}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}