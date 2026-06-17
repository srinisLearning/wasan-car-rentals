export interface IUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  role: "user" | "admin";
  status: "active" | "inactive";
  created_at: string;
}

export interface ICar {
  id: string;
  name: string;
  description: string;
  rent_per_day: number;
  variant: string;
  company: string;
  images: string[];
  status: string;
  created_at: string;
}

export interface IBooking {
  id: string;
  user_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  booked_dates: string[];
  total_amount: number;
  payment_id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
}