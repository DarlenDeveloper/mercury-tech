/**
 * Downloads an array of objects as a CSV file.
 * Filename automatically includes today's date.
 */
export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const fullFilename = `${filename}_${today}`;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val instanceof Date ? val.toISOString() : String(val ?? "");
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fullFilename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
