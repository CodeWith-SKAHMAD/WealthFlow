import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportToExcel(rows, filename = 'wealthflow-report.xlsx', sheetName = 'Report') {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

export function exportToCSV(rows, filename = 'wealthflow-report.csv') {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToPDF(rows, { title = 'WealthFlow Report', filename = 'wealthflow-report.pdf', columns } = {}) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.setTextColor(47, 123, 217)
  doc.text(title, 14, 18)
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 24)

  const cols = columns || (rows.length ? Object.keys(rows[0]) : [])
  const body = rows.map((r) => cols.map((c) => String(r[c] ?? '')))

  autoTable(doc, {
    head: [cols],
    body,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [47, 123, 217] },
    theme: 'striped',
  })

  doc.save(filename)
}
