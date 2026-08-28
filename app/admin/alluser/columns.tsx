"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import { type DataTableFeatures } from "../../../components/data-table-features"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  type: string | null
  email: string
}

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Payment>()

export const columns = columnHelper.columns([
  columnHelper.accessor("type", {
    header: "Role",
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <Button key={row.original.id} variant="outline" size="sm">
        Voir
      </Button>
    ),
  }),
])

