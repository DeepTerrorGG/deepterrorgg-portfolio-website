'use client';

import {
  Package,
  AlertTriangle,
  DollarSign,
  PackageSearch,
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
import { mockProducts } from '@/lib/inventory-mock-data';

export default function InventoryDashboard() {
  
  const totalProducts = mockProducts.length;
  const lowStockItems = mockProducts.filter(p => p.stock < 20).length;
  const totalValue = mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const categories = new Set(mockProducts.map(p => p.category)).size;

  return (
    <div className="flex min-h-screen w-full flex-col bg-card">
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
            amount={`$${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
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
              <CardDescription>A list of all products in the inventory.</CardDescription>
            </CardHeader>
            <CardContent>
               <InventoryDataTable columns={columns} data={mockProducts} />
            </CardContent>
        </Card>
      </main>
    </div>
  )
}
