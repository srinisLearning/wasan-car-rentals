"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ICar } from "@/interfaces";
import { fetchActiveCars } from "@/server-actions/cars";
import { CarTile } from "./_components/car-tile";
import { CarFilters } from "./_components/car-filters";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";

function UserCars() {
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchActiveCars();

        if (!response.success) {
          setError(response.message || "Failed to load cars");
          setCars([]);
        } else {
          setCars(response.data || []);
        }
      } catch (err) {
        setError("An unexpected error occurred while loading cars");
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  // Get unique variants and brands
  const variants = useMemo(() => {
    const uniqueVariants = [...new Set(cars.map((car) => car.variant))];
    return uniqueVariants.sort();
  }, [cars]);

  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(cars.map((car) => car.company))];
    return uniqueBrands.sort();
  }, [cars]);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let result = cars;

    // Apply variant filter
    if (selectedVariant !== "all") {
      result = result.filter(
        (car) => car.variant.toLowerCase() === selectedVariant.toLowerCase(),
      );
    }

    // Apply brand filter
    if (selectedBrand !== "all") {
      result = result.filter(
        (car) => car.company.toLowerCase() === selectedBrand.toLowerCase(),
      );
    }

    // Apply sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.rent_per_day - b.rent_per_day);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.rent_per_day - a.rent_per_day);
    }

    return result;
  }, [cars, selectedVariant, selectedBrand, sortBy]);

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
        Something went wrong while fetching cars.
      </div>
    );
  }

  // Empty State
  if (!cars || cars.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        No cars available at the moment.
      </div>
    );
  }

  // Cars Grid with Filters
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold">Available Cars</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Browse and book from our collection of {cars.length} cars
        </p>
      </div>

      <CarFilters
        onVariantChange={setSelectedVariant}
        onBrandChange={setSelectedBrand}
        onSortChange={setSortBy}
        variants={variants}
        brands={brands}
      />

      {filteredCars.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">
            No cars found matching your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {filteredCars.map((car) => (
            <CarTile key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}

export default UserCars;
