import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Dynamic Excel Export (React)
 * Uses only XLSX.write (NO read/import)
 *
 * @param {Array} columns - [{ key, label, ignore }]
 * @param {Array} data - API data
 * @param {String} fileName - Excel file name
 */
export const exportToExcel = (
  columns = [],
  data = [],
  fileName = "Export"
) => {
  if (!columns.length || !data.length) return;

  // remove ignored columns
  const exportColumns = columns.filter(col => !col.ignore);

  // format rows
  const excelData = data.map(row => {
    const obj = {};
    exportColumns.forEach(col => {
      obj[col.label] = row[col.key] ?? "";
    });
    return obj;
  });

  // create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // auto column width
  worksheet["!cols"] = exportColumns.map(col => ({
    wch: Math.max(col.label.length, 15)
  }));

  // workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // export
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  saveAs(blob, `${fileName}.xlsx`);
};
