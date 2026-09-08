import ExcelJS from "exceljs";

type Reservation = {
  date: Date | string;
  child: {
    name: string;
    surname: string;
    schooling: string;
  };
  meal: {
    type: string;
  };
};

export async function createReservationWorkbook(reservations: Reservation[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Réservations");

  sheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Prénom", key: "surname", width: 25 },
    { header: "Nom", key: "name", width: 25 },
    { header: "Scolarité", key: "schooling", width: 15 },
    { header: "Repas", key: "meal", width: 20 },
  ];

  reservations.forEach((reservation) => {
    sheet.addRow({
      date: reservation.date,
      surname: reservation.child.surname,
      name: reservation.child.name,
      schooling: reservation.child.schooling,
      meal: reservation.meal.type,
    });
  });

  return workbook;
}