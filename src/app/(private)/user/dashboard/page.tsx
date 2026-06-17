"use client";
import { useState, useEffect } from "react";
import { getUserDashboardStats } from "@/server-actions/dashboard";
 
import { useUsersStore } from "@/store/users-store";
import {
  BookOpen,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import DashboardCard from "../../admin/dashboard/_components/dashboard-card";

interface UserDashboardStats {
  totalBookings: number;
  totalAmountSpent: number;
  confirmedBookings: number;
  last5Bookings: Array<{
    id: string;
    status: string;
    total_amount: number;
    start_date: string;
    end_date: string;
    cars: {
      name: string;
      company: string;
      variant: string;
      images: string[];
    };
  }>;
}

export default function UserDashboard() {
  const { currentUser } = useUsersStore();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadStats();
    }
  }, [currentUser?.id]);

  const loadStats = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    setError(null);
    const response: any = await getUserDashboardStats(currentUser.id);

    if (response.success) {
      setStats(response.data);
    } else {
      setError(response.message);
    }
    setLoading(false);
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-primary mb-4">My Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-900 font-medium">
                Error Loading Dashboard
              </p>
              <p className="text-red-700 text-sm mt-1">
                {error || "Failed to load dashboard statistics"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={loadStats}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your booking overview.
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="All your bookings"
          icon={BookOpen}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <DashboardCard
          title="Amount Spent"
          value={`$${stats.totalAmountSpent.toLocaleString()}`}
          subtitle="Total spent on rentals"
          icon={DollarSign}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <DashboardCard
          title="Active Bookings"
          value={stats.confirmedBookings}
          subtitle="Confirmed reservations"
          icon={CheckCircle}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
          <TrendingUp className="w-4 h-4 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Bookings
          </h2>
        </div>

        {stats.last5Bookings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No bookings yet</p>
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/user/cars")}
            >
              Book a Car Now
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto light-scrollbar">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-100">
                  <TableHead className="h-12 py-3">Car Details</TableHead>
                  <TableHead className="h-12 py-3">Start Date</TableHead>
                  <TableHead className="h-12 py-3">End Date</TableHead>
                  <TableHead className="h-12 py-3">Days</TableHead>
                  <TableHead className="h-12 py-3">Amount</TableHead>
                  <TableHead className="h-12 py-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.last5Bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-900">
                          {booking.cars.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.cars.company?.toUpperCase()} -{" "}
                          {booking.cars.variant?.toUpperCase()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {dayjs(booking.start_date).format("MMM DD YYYY")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {dayjs(booking.end_date).format("MMM DD YYYY")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {booking.start_date && booking.end_date
                        ? dayjs(booking.end_date).diff(
                            dayjs(booking.start_date),
                            "day",
                          )
                        : 0}{" "}
                      days
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      ${booking.total_amount}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {booking.status?.toUpperCase()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Stats Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Avg Booking Cost</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {stats.totalBookings > 0
              ? `$${(stats.totalAmountSpent / stats.totalBookings).toFixed(2)}`
              : "$0.00"}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">
            Pending Confirmations
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.totalBookings - stats.confirmedBookings}
          </p>
        </div>
      </div>
    </div>
  );
}
