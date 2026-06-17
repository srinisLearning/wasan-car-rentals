"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { fetchAllBookings, updateBookingStatus } from "@/server-actions/bookings";
import { IBooking } from "@/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dayjs from "dayjs";

interface BookingWithDetails extends IBooking {
  cars: {
    name: string;
    company: string;
    variant: string;
    rent_per_day: number;
    images: string[];
  };
  users: {
    name: string;
    email: string;
  };
}

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch bookings on mount
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    const response: any = await fetchAllBookings();
    if (response.success) {
      setBookings(response.data || []);
    } else {
      setError(response.message);
      toast.error(response.message);
    }
    setLoading(false);
  };

  const handleStatusChange = async (
    bookingId: string,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed",
  ) => {
    setUpdatingId(bookingId);
    const response = await updateBookingStatus(bookingId, newStatus);

    if (response.success) {
      toast.success(response.message);
      await loadBookings();
    } else {
      toast.error(response.message);
    }
    setUpdatingId(null);
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Bookings</h1>
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
              No bookings found
            </h3>
            <p className="text-gray-500">
              There are no bookings to display at the moment.
            </p>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && bookings.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow className="hover:bg-gray-100">
                <TableHead className="h-12 py-3">Customer Name</TableHead>
                <TableHead className="h-12 py-3">Car Details</TableHead>
                <TableHead className="h-12 py-3">Start Date</TableHead>
                <TableHead className="h-12 py-3">End Date</TableHead>
                <TableHead className="h-12 py-3">Days</TableHead>
                <TableHead className="h-12 py-3">Total Amount</TableHead>
                <TableHead className="h-12 py-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{booking.users?.name}</p>
                      <p className="text-sm text-gray-500">
                        {booking.users?.email}
                      </p>
                    </div>
                  </TableCell>
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
                    <Select
                      value={booking.status}
                      onValueChange={(value) =>
                        handleStatusChange(
                          booking.id,
                          value as
                            | "pending"
                            | "confirmed"
                            | "cancelled"
                            | "completed",
                        )
                      }
                      disabled={updatingId === booking.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                status,
                              )}`}
                            >
                              {status.toUpperCase()}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}