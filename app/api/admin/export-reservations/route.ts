import { NextResponse } from 'next/server'

import { getReservationsForExport } from '@/actions/export'
import { createReservationWorkbook } from '@/lib/excel'

export async function GET() {
  const reservations = await getReservationsForExport()
  const workbook = await createReservationWorkbook(reservations)
  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="reservations.xlsx"',
    },
  })
}