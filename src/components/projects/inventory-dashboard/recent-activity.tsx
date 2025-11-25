import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockSuppliers } from "@/lib/inventory-mock-data";

export function RecentActivity() {
  const recentActivities = [
    { name: 'John Doe', activity: 'Added new product "Ergonomic Chair"' },
    { name: 'Jane Smith', activity: 'Updated stock for "Wireless Mouse"' },
    { name: 'Supplier Inc.', activity: 'Delivered 50 units of "Mechanical Keyboard"' },
    { name: 'Alice Johnson', activity: 'Marked "Monitor Stand" as low stock' },
    { name: 'Bob Brown', activity: 'Created new category "Office Electronics"' },
  ];
  const suppliers = mockSuppliers;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {recentActivities.map((activity, index) => (
            <div className="flex items-center gap-4" key={index}>
                <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src={`https://i.pravatar.cc/40?u=${activity.name}`} alt="Avatar" />
                <AvatarFallback>{activity.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{activity.name}</p>
                <p className="text-sm text-muted-foreground">
                    {activity.activity}
                </p>
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  )
}
