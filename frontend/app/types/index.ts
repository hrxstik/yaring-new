export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  phoneVerified: boolean;
  createdAt: string;
}

export type BookingType = 'daily' | 'hourly';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export interface BookableEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  bookingType: BookingType;
  pricePerDay: number;
  pricePerHour?: number;
  capacity: number;
  amenities: string[];
  isActive: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  entityId: string;
  entityName: string;
  bookingType: BookingType;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  totalPrice: number;
  status: BookingStatus;
  paymentId?: string;
  createdAt: string;
}

export interface ContentPage {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface Availability {
  blockedDates: string[];
  blockedSlots: { date: string; startTime: string; endTime: string }[];
}
