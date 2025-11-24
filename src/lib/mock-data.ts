
// src/lib/mock-data.ts
import { faker } from '@faker-js/faker';

export type Order = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderDate: Date;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  amount: number;
};

export type User = {
    name: string;
    email: string;
    avatar: string;
};

export type Sales = {
    revenue: number;
    subscriptions: number;
};

// --- MOCK DATA GENERATION ---

function createRandomOrder(): Order {
  return {
    orderId: `ORD-${faker.string.alphanumeric(5).toUpperCase()}`,
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email(),
    orderDate: faker.date.recent({ days: 30 }),
    status: faker.helpers.arrayElement(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']),
    amount: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
  };
}

function createRandomUser(): User {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
    }
}

export const mockOrders: Order[] = Array.from({ length: 250 }, createRandomOrder);
export const mockUsers: User[] = Array.from({ length: 10 }, createRandomUser);

export const mockSalesData = [
  { name: 'Jan', revenue: 4000, subscriptions: 2400 },
  { name: 'Feb', revenue: 3000, subscriptions: 1398 },
  { name: 'Mar', revenue: 9800, subscriptions: 2000 },
  { name: 'Apr', revenue: 3908, subscriptions: 2780 },
  { name: 'May', revenue: 4800, subscriptions: 1890 },
  { name: 'Jun', revenue: 3800, subscriptions: 2390 },
  { name: 'Jul', revenue: 4300, subscriptions: 3490 },
  { name: 'Aug', revenue: 5100, subscriptions: 2100 },
  { name: 'Sep', revenue: 6200, subscriptions: 3200 },
  { name: 'Oct', revenue: 7300, subscriptions: 3800 },
  { name: 'Nov', revenue: 8400, subscriptions: 4100 },
  { name: 'Dec', revenue: 10500, subscriptions: 4300 },
];
