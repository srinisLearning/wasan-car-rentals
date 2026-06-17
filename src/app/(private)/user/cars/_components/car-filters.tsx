import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CarFiltersProps {
  onVariantChange: (variant: string) => void;
  onBrandChange: (brand: string) => void;
  onSortChange: (sortBy: string) => void;
  variants: string[];
  brands: string[];
}

export function CarFilters({
  onVariantChange,
  onBrandChange,
  onSortChange,
  variants,
  brands,
}: CarFiltersProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Variant Filter */}
          <div className="select">
            <label className="text-sm text-gray-600 block mb-2">Variant</label>
            <Select onValueChange={onVariantChange} defaultValue="all">
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Variants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Variants</SelectItem>
                <SelectItem value="petrol">Petrol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                {variants
                  .filter(
                    (v) =>
                      !["petrol", "diesel", "electric"].includes(
                        v.toLowerCase(),
                      ),
                  )
                  .map((variant) => (
                    <SelectItem key={variant} value={variant}>
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand Filter */}
          <div className="select">
            <label className="text-sm text-gray-600 block mb-2">Brand</label>
            <Select onValueChange={onBrandChange} defaultValue="all">
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand.charAt(0).toUpperCase() + brand.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="select">
            <label className="text-sm text-gray-600 block mb-2">Sort By</label>
            <Select onValueChange={onSortChange} defaultValue="default">
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarFilters;
