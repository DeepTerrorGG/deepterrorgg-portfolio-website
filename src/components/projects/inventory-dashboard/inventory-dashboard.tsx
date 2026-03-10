'use client';

import { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  DollarSign,
  PackageSearch,
  Monitor
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { StatsCard } from '@/components/projects/inventory-dashboard/stats-card';
import { InventoryChart } from '@/components/projects/inventory-dashboard/inventory-chart';
import { RecentActivity } from '@/components/projects/inventory-dashboard/recent-activity';
import { InventoryDataTable } from '@/components/projects/inventory-dashboard/data-table';
import { columns } from '@/components/projects/inventory-dashboard/columns';
import { mockProducts as initialMockProducts, Product } from '@/lib/inventory-mock-data';

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>(initialMockProducts);

  const updateProduct = (sku: string, updatedData: Partial<Product>) => {
    setProducts(currentProducts =>
      currentProducts.map(product =>
        product.sku === sku ? { ...product, ...updatedData } : product
      )
    );
  };

  const totalProducts = products.length;
  const lowStockItems = useMemo(() => products.filter(p => p.stock < 20).length, [products]);
  const totalValue = useMemo(() => products.reduce((sum, p) => sum + (p.price * p.stock), 0), [products]);
  const categories = useMemo(() => new Set(products.map(p => p.category)).size, [products]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-card relative">
      {/* Mobile Not Supported Overlay */}
      <div className="md:hidden fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 mb-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
          <Monitor className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Desktop Experience Required</h2>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          The Inventory Management Dashboard contains dense data tables and complex charts that are fully optimized for larger screens. Please visit this page on your desktop or laptop.
        </p>
      </div>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <StatsCard
            title="Total Products"
            amount={totalProducts.toLocaleString()}
            description="+20% from last month"
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Total Inventory Value"
            amount={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            description="+15% from last month"
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Low Stock Items"
            amount={lowStockItems.toLocaleString()}
            description="Items with stock below 20 units"
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Product Categories"
            amount={categories.toLocaleString()}
            description="+5 new categories this month"
            icon={<PackageSearch className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Stock Levels Over Time</CardTitle>
              <CardDescription>
                Total units in inventory over the past year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryChart />
            </CardContent>
          </Card>
          <RecentActivity />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>A list of all products in the inventory. Click on a cell to edit.</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryDataTable columns={columns} data={products} updateProduct={updateProduct} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
