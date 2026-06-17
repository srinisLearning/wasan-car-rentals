"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ICar } from "@/interfaces";
import { fetchCarById } from "@/server-actions/cars";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { CheckAvailability } from "./_components/check-availability";

function CarDetail() {
  const params = useParams();
  const carId = params.id as string;
  const [car, setCar] = useState<ICar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCar = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCarById(carId);

        if (!response.success) {
          setError(response.message || "Failed to load car");
          setCar(null);
        } else {
          setCar(response.data || null);
        }
      } catch (err) {
        setError("An unexpected error occurred while loading car details");
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      loadCar();
    }
  }, [carId]);

  // Loading State
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not Found State
  if (!car) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertDescription>Car not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Car Detail
  return (
    <div className="w-full mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Car Image */}
        <div className="flex flex-col gap-5">
          <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
            {car.images && car.images.length > 0 ? (
              <img
                src={car.images[0]}
                alt={car.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No Image
              </div>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {car.description}
          </p>
        </div>

        {/* Car Details */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{car.name}</h1>
            <p className="text-gray-600 text-sm mt-1 uppercase">
              {car.company}
            </p>
          </div>

          <div className="space-y-3 border-t border-b py-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Variant</span>
              <span className="text-sm font-semibold uppercase">
                {car.variant}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-semibold capitalize">
                {car.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rent Per Day</span>
              <span className="text-lg font-bold text-primary">
                ${car.rent_per_day}
              </span>
            </div>
          </div>

          <CheckAvailability car={car} />
        </div>
      </div>
    </div>
  );
}

export default CarDetail;
