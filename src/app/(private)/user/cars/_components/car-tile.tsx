import React from "react";
import { ICar } from "@/interfaces";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CarTileProps {
  car: ICar;
}

export function CarTile({ car }: CarTileProps) {
  return (
    <Link href={`/user/cars/${car.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-300 w-full cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-base">{car.name}</CardTitle>
          <CardDescription className="text-sm uppercase">
            {car.company}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-0">
          {/* Car Image */}
          <div className="relative w-full h-60 bg-gray-200 rounded-lg overflow-hidden">
            {car.images && car.images.length > 0 ? (
              <img
                src={car.images[0]}
                alt={car.name}
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="space-y-2  mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Variant</span>
              <span className="text-sm font-medium uppercase">
                {car.variant}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rent Per Day</span>
              <span className="text-sm font-bold text-primary">
                ${car.rent_per_day}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default CarTile;
