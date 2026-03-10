
// src/app/dashboard/page.tsx
'use client';
import { useState, useMemo } from 'react';
import {
  Activity,
  DollarSign,
  Users,
  CreditCard,
  Monitor
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import StatsCard from '@/components/dashboard/stats-card';
import SalesChart from '@/components/dashboard/sales-chart';
import RecentSales from '@/components/dashboard/recent-sales';
import OrdersDataTable from '@/components/dashboard/data-table';
import { columns } from '@/components/dashboard/columns';
import { mockOrders as initialMockOrders, Order } from '@/lib/mock-data';
import AnimateOnScroll from '@/components/ui/animate-on-scroll';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>(initialMockOrders);

  // This function will be passed down to the DataTable to handle updates
  const updateOrder = (orderId: string, updatedData: Partial<Order>) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.orderId === orderId ? { ...order, ...updatedData } : order
      )
    );
  };

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, order) => {
      if (order.status !== 'Cancelled') {
        return acc + order.amount;
      }
      return acc;
    }, 0);
  }, [orders]);

  const totalSales = useMemo(() => {
    return orders.filter(order => order.status !== 'Cancelled').length;
  }, [orders]);


  return (
    <div className="flex min-h-screen w-full flex-col relative">
      {/* Mobile Not Supported Overlay */}
      <div className="md:hidden fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 mb-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
          <Monitor className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Desktop Experience Required</h2>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          The E-commerce Dashboard contains dense data tables and complex charts that are fully optimized for larger screens. Please visit this page on your desktop or laptop.
        </p>
      </div>

      <AnimateOnScroll asChild>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <StatsCard
              title="Total Revenue"
              amount={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              description="+20.1% from last month"
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Subscriptions"
              amount="+2350"
              description="+180.1% from last month"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Sales"
              amount={`+${totalSales.toLocaleString()}`}
              description="+19% from last month"
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Active Now"
              amount="+573"
              description="+201 since last hour"
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesChart />
              </CardContent>
            </Card>
            <RecentSales />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>A list of all orders. Click on a status or amount to edit.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersDataTable columns={columns} data={orders} updateOrder={updateOrder} />
            </CardContent>
          </Card>
        </main>
      </AnimateOnScroll>
    </div>
  )
}
