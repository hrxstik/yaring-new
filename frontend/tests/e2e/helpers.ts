import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const API_URL = process.env.E2E_API_URL ?? 'http://127.0.0.1:4100/api';

export type TestSession = {
  accessToken: string;
  user: {
    id: string;
    phone: string;
    name: string;
    role: 'user' | 'admin';
  };
};

export type TestEntity = {
  id: string;
  name: string;
  slug: string;
  bookingType: 'daily' | 'hourly';
  pricePerDay: number;
  pricePerHour?: number;
};

export type TestBooking = {
  id: string;
  entityName: string;
  status: string;
  totalPrice: number;
};

export function uniquePhone() {
  const suffix = `${String(Date.now()).slice(-7)}${Math.floor(10 + Math.random() * 90)}`;
  return `+79${suffix}`;
}

export function futureIsoDate(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export async function loginByApi(
  request: APIRequestContext,
  phone: string,
  password: string,
) {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: { phone, password },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as TestSession;
}

export async function createVerifiedUser(request: APIRequestContext) {
  const phone = uniquePhone();
  const response = await request.post(`${API_URL}/auth/test-user`, {
    data: {
      phone,
      password: 'User12345!',
      name: 'E2E Пользователь',
    },
  });
  expect(
    response.ok(),
    `create test user failed: ${response.status()} ${await response.text()}`,
  ).toBeTruthy();
  return (await response.json()) as TestSession;
}

export async function authorizePage(page: Page, session: TestSession) {
  await page.addInitScript((token) => {
    window.localStorage.setItem('yaring-token', token);
  }, session.accessToken);
}

export async function getEntities(request: APIRequestContext) {
  const response = await request.get(`${API_URL}/entities`);
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as TestEntity[];
}

export async function createPaidBooking(
  request: APIRequestContext,
  session: TestSession,
  options: {
    type: 'daily' | 'hourly';
    startOffsetDays: number;
  },
) {
  const entities = await getEntities(request);
  const entity = entities.find((item) => item.bookingType === options.type);
  expect(entity, `entity with type ${options.type}`).toBeTruthy();

  const availabilityResponse = await request.get(
    `${API_URL}/availability/${entity!.id}?from=${futureIsoDate(1)}&to=${futureIsoDate(365)}`,
  );
  expect(availabilityResponse.ok()).toBeTruthy();
  const availability = await availabilityResponse.json() as {
    blockedDates: string[];
    blockedSlots: { date: string; startTime: string; endTime: string }[];
  };

  const startDate = findAvailableDate(availability, options);
  const endDate = options.type === 'daily' ? futureIsoDateFrom(startDate, 1) : startDate;

  const bookingResponse = await request.post(`${API_URL}/bookings`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    data: {
      entityId: entity!.id,
      startDate,
      endDate,
      startTime: options.type === 'hourly' ? '10:00' : undefined,
      endTime: options.type === 'hourly' ? '12:00' : undefined,
    },
  });
  expect(
    bookingResponse.ok(),
    `booking create failed: ${bookingResponse.status()} ${await bookingResponse.text()}`,
  ).toBeTruthy();
  const booking = (await bookingResponse.json()) as TestBooking;

  const paymentResponse = await request.post(`${API_URL}/payments`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    data: {
      bookingId: booking.id,
      amount: booking.totalPrice,
      description: `E2E бронирование: ${booking.entityName}`,
    },
  });
  expect(paymentResponse.ok()).toBeTruthy();
  const payment = await paymentResponse.json() as { paymentId: string };

  const completeResponse = await request.post(
    `${API_URL}/payments/${payment.paymentId}/mock-complete`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } },
  );
  expect(
    completeResponse.ok(),
    `mock payment complete failed: ${completeResponse.status()} ${await completeResponse.text()}`,
  ).toBeTruthy();

  return { booking, entity: entity! };
}

function findAvailableDate(
  availability: {
    blockedDates: string[];
    blockedSlots: { date: string; startTime: string; endTime: string }[];
  },
  options: { type: 'daily' | 'hourly'; startOffsetDays: number },
) {
  for (let offset = options.startOffsetDays; offset < 365; offset += 1) {
    const date = futureIsoDate(offset);
    if (options.type === 'daily') {
      const nextDate = futureIsoDate(offset + 1);
      if (!availability.blockedDates.includes(date) && !availability.blockedDates.includes(nextDate)) {
        return date;
      }
      continue;
    }

    const hasSlotConflict = availability.blockedSlots.some(
      (slot) =>
        slot.date === date &&
        '10:00' < slot.endTime &&
        '12:00' > slot.startTime,
    );
    if (!hasSlotConflict) return date;
  }

  throw new Error('No available e2e booking date found');
}

function futureIsoDateFrom(iso: string, offsetDays: number) {
  const date = new Date(iso);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export async function cancelBooking(
  request: APIRequestContext,
  session: TestSession,
  bookingId: string,
) {
  const response = await request.post(`${API_URL}/bookings/${bookingId}/cancel`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  expect(response.ok()).toBeTruthy();
}
