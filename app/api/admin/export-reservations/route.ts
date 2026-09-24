import { NextResponse } from 'next/server'

import { getReservationsForExport } from '@/actions/export'
import { createReservationWorkbook } from '@/lib/excel'
import { format } from 'date-fns'
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const reservations = await getReservationsForExport(start ?? undefined, end ?? undefined)
  const workbook = await createReservationWorkbook(reservations)
  const buffer = await workbook.xlsx.writeBuffer()

  const filename = start && end
    ? `reservations_${start}_to_${end}.xlsx`
    : 'reservations.xlsx'

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}