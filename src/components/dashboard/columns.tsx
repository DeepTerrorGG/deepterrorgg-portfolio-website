// src/components/dashboard/columns.tsx
"use client"

import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Order } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "../ui/input"

const statuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const EditableCell = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const { updateOrder } = table.options.meta;

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      updateOrder(row.original.orderId, { [column.id]: parsedValue });
    }
  }

  return (
     <Input
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-24 text-right"
      type="number"
    />
  )
}

const StatusCell = ({ getValue, row, table }: any) => {
  const initialValue = getValue();
  const { updateOrder } = table.options.meta;

  const onSelectChange = (newValue: Order['status']) => {
    updateOrder(row.original.orderId, { status: newValue });
  }

  const variant = {
    "Pending": "secondary",
    "Processing": "default",
    "Shipped": "outline",
    "Delivered": "default",
    "Cancelled": "destructive",
  }[initialValue] ?? "default";

  return (
    <Select value={initialValue} onValueChange={onSelectChange}>
        <SelectTrigger className="w-[120px] focus:ring-transparent border-none">
            <SelectValue asChild>
                 <Badge variant={variant as any}>{initialValue}</Badge>
            </SelectValue>
        </SelectTrigger>
        <SelectContent>
            {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
        </SelectContent>
    </Select>
  );
}


export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderId",
    header: "Order ID",
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "customerEmail",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: StatusCell
  },
  {
    accessorKey: "orderDate",
    header: "Date",
    cell: ({ row }) => {
        const date = row.getValue("orderDate") as Date;
        return <span>{date.toLocaleDateString()}</span>;
    }
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: EditableCell,
  },
]
