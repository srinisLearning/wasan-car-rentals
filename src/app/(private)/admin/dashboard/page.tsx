"use client";
import { useState, useEffect } from "react";
import { getAdminDashboardStats } from "@/server-actions/dashboard";
import DashboardCard from "./_components/dashboard-card";
import {
  Car,
  Users,
  BookOpen,
  DollarSign,
  AlertCircle,
  TrendingUp,
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

interface DashboardStats {
  totalCars: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  last5Bookings: Array<{
    id: string;
    status: string;
    total_amount: number;
    start_date: string;
    end_date: string;
    cars: {
      name: string;
      company: string;
    };
    users: {
      name: string;
      email: string;
    };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    const response: any = await getAdminDashboardStats();

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
        <h1 className="text-2xl font-bold text-primary mb-4">Dashboard</h1>
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
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Cars"
          value={stats.totalCars}
          subtitle="Active inventory"
          icon={Car}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="Registered customers"
          icon={Users}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <DashboardCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="All time bookings"
          icon={BookOpen}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <DashboardCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          subtitle="From all bookings"
          icon={DollarSign}
          bgColor="bg-amber-100"
          iconColor="text-amber-600"
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
          </div>
        ) : (
          <div className="overflow-x-auto light-scrollbar">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-100">
                  <TableHead className="h-12 py-3">Customer</TableHead>
                  <TableHead className="h-12 py-3">Car</TableHead>
                  <TableHead className="h-12 py-3">Start Date</TableHead>
                  <TableHead className="h-12 py-3">End Date</TableHead>
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
                          {booking.users.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.users.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-900">
                          {booking.cars.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.cars.company?.toUpperCase()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {dayjs(booking.start_date).format("MMM DD YYYY")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {dayjs(booking.end_date).format("MMM DD YYYY")}
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

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Avg Booking Value</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {stats.totalBookings > 0
              ? `$${(stats.totalRevenue / stats.totalBookings).toFixed(2)}`
              : "$0.00"}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">
            Bookings This Month
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.last5Bookings.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Active Users</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {stats.totalUsers}
          </p>
        </div>
      </div>
    </div>
  );
}
