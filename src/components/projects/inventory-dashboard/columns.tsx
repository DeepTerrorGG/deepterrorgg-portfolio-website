"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/lib/inventory-mock-data"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Product
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    )
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.stock}</div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <div className="text-right">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {`$${row.original.price.toFixed(2)}`}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const stock = row.original.stock;
      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (stock === 0) status = 'Out of Stock';
      else if (stock < 20) status = 'Low Stock';

      return (
        <Badge
          variant={status === 'In Stock' ? 'default' : status === 'Low Stock' ? 'secondary' : 'destructive'}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
  },
]
