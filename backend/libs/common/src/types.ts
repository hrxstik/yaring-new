export type UserRole = 'user' | 'admin';

export type BookingType = 'daily' | 'hourly';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type PaymentStatus = 'pending' | 'succeeded' | 'cancelled' | 'failed';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

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
  createdAt: string;
  updatedAt: string;
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

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface ContentPage {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
}
