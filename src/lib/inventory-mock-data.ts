import { faker } from '@faker-js/faker';

export type Product = {
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  supplier: string;
};

export const mockCategories = [
  'Electronics',
  'Office Supplies',
  'Furniture',
  'Apparel',
  'Groceries',
  'Books',
];

export const mockSuppliers = [
  'Global Tech Inc.',
  'Office Essentials Ltd.',
  'Furnish & Co.',
  'Fashion Forward',
  'Fresh Farms',
  'Bookworm Dist.',
];

function createRandomProduct(): Product {
  const stock = faker.number.int({ min: 0, max: 200 });
  let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
  if (stock === 0) status = 'Out of Stock';
  else if (stock < 20) status = 'Low Stock';
  
  return {
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    name: faker.commerce.productName(),
    category: faker.helpers.arrayElement(mockCategories),
    stock: stock,
    price: parseFloat(faker.commerce.price()),
    status: status,
    supplier: faker.helpers.arrayElement(mockSuppliers),
  };
}

export const mockProducts: Product[] = Array.from({ length: 150 }, createRandomProduct);

export const inventoryLevels = [
    { month: "Jan", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Feb", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Mar", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Apr", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "May", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Jun", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Jul", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Aug", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Sep", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Oct", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Nov", total: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Dec", total: Math.floor(Math.random() * 5000) + 10000 },
];
