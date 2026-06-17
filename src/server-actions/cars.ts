"use server";
import { createSupabaseServerClient } from "@/config/supabase-server-config";
import { ICar } from "@/interfaces";

export const addCar = async (payload: Partial<ICar>) => {
  try {
    const supabase = await createSupabaseServerClient();

    const carsTableResponse = await supabase.from("car_rental_cars").insert([
      {
        name: payload.name,
        description: payload.description,
        rent_per_day: payload.rent_per_day,
        variant: payload.variant,
        company: payload.company,
        images: payload.images,
        status: payload.status || "active",
      },
    ]);

    if (carsTableResponse.error) {
      return { success: false, message: carsTableResponse.error.message };
    }

    return { success: true, message: "Car added successfully" };
  } catch (error) {
    return { success: false, message: "Failed to add car" };
  }
};

export const fetchCars = async () => {
  try {
    const supabase = await createSupabaseServerClient();

    const carsTableResponse = await supabase.from("car_rental_cars").select("*");

    if (carsTableResponse.error) {
      return { success: false, message: carsTableResponse.error.message };
    }

    return { success: true, data: carsTableResponse.data };
  } catch (error) {
    return { success: false, message: "Failed to fetch cars" };
  }
};

export const fetchCarById = async (carId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const carsTableResponse = await supabase
      .from("car_rental_cars")
      .select("*")
      .eq("id", carId)
      .single();

    if (carsTableResponse.error) {
      return { success: false, message: carsTableResponse.error.message };
    }

    return { success: true, data: carsTableResponse.data };
  } catch (error) {
    return { success: false, message: "Failed to fetch car" };
  }
};

export const updateCarById = async (carId: string, payload: Partial<ICar>) => {
  try {
    const supabase = await createSupabaseServerClient();

    const carsTableResponse = await supabase
      .from("car_rental_cars")
      .update({
        name: payload.name,
        description: payload.description,
        rent_per_day: payload.rent_per_day,
        variant: payload.variant,
        company: payload.company,
        images: payload.images,
        status: payload.status,
      })
      .eq("id", carId);

    if (carsTableResponse.error) {
      return { success: false, message: carsTableResponse.error.message };
    }

    return { success: true, message: "Car updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to update car" };
  }
};

export const deleteCarById = async (carId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const carsTableResponse = await supabase
      .from("car_rental_cars")
      .delete()
      .eq("id", carId);

    if (carsTableResponse.error) {
      return { success: false, message: carsTableResponse.error.message };
    }

    return { success: true, message: "Car deleted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to delete car" };
  }
};

export const fetchActiveCars = async () => {
  try {
    const supabase = await createSupabaseServerClient();

    const carsTableResponse = await supabase
      .from("car_rental_cars")
      .select("*")
      .eq("status", "active");

    if (carsTableResponse.error) {
      return { success: false, message: carsTableResponse.error.message };
    }

    return { success: true, data: carsTableResponse.data };
  } catch (error) {
    return { success: false, message: "Failed to fetch active cars" };
  }
};