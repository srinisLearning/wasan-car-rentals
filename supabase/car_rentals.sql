-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.car_rental_users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  phone text,
  role text,
  status text,
  name text,
  CONSTRAINT car_rental_users_pkey PRIMARY KEY (id)
);

========================================================================

CREATE TABLE public.car_rental_cars (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  description text,
  company text,
  variant text,
  rent_per_day double precision,
  status text,
  images ARRAY,
  CONSTRAINT car_rental_cars_pkey PRIMARY KEY (id)
);

=========================================================================

CREATE TABLE public.car_rental_bookings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  car_id bigint,
  user_id bigint,
  booked_dates ARRAY,
  total_amount double precision,
  payment_id text,
  status text,
  start_date date,
  end_date date,
  CONSTRAINT car_rental_bookings_pkey PRIMARY KEY (id),
  CONSTRAINT car_rental_bookings_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.car_rental_cars(id),
  CONSTRAINT car_rental_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.car_rental_users(id)
);

*****************************************
car_rental_bookings_user_id_fkey

Foreign key relation to:

public.car_rental_users
user_id
public.car_rental_users.id

*****************************************
car_rental_bookings_user_id_fkey

Foreign key relation to:

public.car_rental_users
user_id
public.car_rental_users.id

*****************************************