"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import { type DataTableFeatures } from "@/components/data-table-features"
import Link from "next/link"

// This type is used to define the shape of our data.
export type Meal = {
  type: string,
  portion: string,
  price: number,
  id: number
}

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Meal>()

export const columns = columnHelper.columns([
  columnHelper.accessor("type", {
    header: "Repas",
  }),
  columnHelper.accessor("portion", {
    header: "Portion",
  }),
  columnHelper.accessor("price", {
    header: "Prix",
  }),
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <Button key={row.original.id} nativeButton={false} variant="outline" size="sm" render={<Link href={`/admin/price/${row.original.id}`} />}>
        Modifier
      </Button>
    ),
  }),
])

