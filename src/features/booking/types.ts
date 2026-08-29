import type { Currency } from "@/core/constants/currencies";
import type { BookingStatus } from "@/core/constants/booking";
import type { PaymentMethod } from "@/features/booking/constants";

/** A purchasable add-on shown on the checkout page. */
export interface AddonDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: Currency;
}

/** Public booking-page representation of a tour (price + identity only). */
export interface BookableTour {
  id: string;
  title: string;
  slug: string;
  base_price: number;
  currency: Currency;
}

/** A line item selected on the checkout page. */
export interface BookingAddonInput {
  addon_id: string;
  quantity: number;
}

export interface CreateBookingInput {
  tour_id: string;
  tour_date: string; // ISO date (yyyy-mm-dd)
  num_people: number;
  addons: BookingAddonInput[];
  payment_method: PaymentMethod;
}

export interface BookingAddonDto {
  addon_id: string;
  name: string;
  quantity: number;
  price_at_time: number;
}

export interface BookingDto {
  id: string;
  tour_id: string;
  tour_title: string;
  tour_date: Date;
  num_people: number;
  total_amount: number;
  currency: Currency;
  status: BookingStatus;
  payment_method: PaymentMethod;
  receipt_image_url: string | null;
  addons: BookingAddonDto[];
  created_at: Date;
}

export interface CreateBookingResult {
  booking: BookingDto;
  /** Stripe PaymentIntent client secret (Stripe payment method) or null. */
  paymentIntentClientSecret: string | null;
}
