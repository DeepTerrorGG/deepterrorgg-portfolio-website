"use client"

import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Product, mockCategories, mockSuppliers } from "@/lib/inventory-mock-data"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const EditableCell = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const { updateProduct } = table.options.meta;

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    // For numeric fields, parse to float
    const isNumeric = column.id === 'price' || column.id === 'stock';
    const finalValue = isNumeric ? parseFloat(value) : value;
    if (isNumeric && isNaN(finalValue)) {
      // Revert if not a valid number
      setValue(initialValue);
    } else {
      updateProduct(row.original.sku, { [column.id]: finalValue });
    }
  }

  return (
     <Input
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-full h-8 px-2 py-1"
      type={column.id === 'price' || column.id === 'stock' ? 'number' : 'text'}
    />
  )
}

const SelectCell = ({ getValue, row, column, table, options }: any) => {
  const initialValue = getValue();
  const { updateProduct } = table.options.meta;

  const onSelectChange = (newValue: string) => {
    updateProduct(row.original.sku, { [column.id]: newValue });
  }

  return (
    <Select value={initialValue} onValueChange={onSelectChange}>
        <SelectTrigger className="w-[150px] focus:ring-transparent border-none h-8">
            <SelectValue/>
        </SelectTrigger>
        <SelectContent>
            {options.map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
        </SelectContent>
    </Select>
  );
}


export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Product
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: EditableCell,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: EditableCell,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: (props) => <SelectCell {...props} options={mockCategories} />,
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
    cell: EditableCell,
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
    cell: EditableCell,
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
    cell: (props) => <SelectCell {...props} options={mockSuppliers} />,
  },
]
