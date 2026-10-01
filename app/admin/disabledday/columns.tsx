"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import { type DataTableFeatures } from "../../../components/data-table-features"
import { unblockDate } from "@/actions/blocked-day"



// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Dayblock = {
  id: number
  blocked_date: string | null
  reason: string | null
}



// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Dayblock>()

export const columns = columnHelper.columns([
  columnHelper.accessor("blocked_date", {
    header: "Date",
  }),
  columnHelper.accessor("reason", {
    header: "Raison",
  }),
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <form action={unblockDate}>
        <Button
          type="submit"
          name="blockedDayId"
          value={String(row.original.id)}
          size="sm"
        >
          Débloquer la date
        </Button>
      </form>
    ),
  }),
])

