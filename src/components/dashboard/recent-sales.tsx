// src/components/dashboard/recent-sales.tsx
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
import { mockUsers } from "@/lib/mock-data";

export default function RecentSales() {
    const users = mockUsers.slice(0, 5); // Take first 5 for recent sales
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {users.map((user, index) => (
            <div className="flex items-center gap-4" key={index}>
                <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src={user.avatar} alt="Avatar" />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                    {user.email}
                </p>
                </div>
                <div className="ml-auto font-medium">+{`$${((index + 1) * 450.99).toFixed(2)}`}</div>
            </div>
        ))}
      </CardContent>
    </Card>
  )
}
