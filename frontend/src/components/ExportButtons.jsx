import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExportButtons({ rows, columns, sql }) {
  if (!rows || rows.length === 0) return null;

  const exportCSV = () => {
    const data = rows.map(row => {
      const obj = {};
      columns.forEach(col => { obj[col] = row[col]; });
      return obj;
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: columns.length > 5 ? 'landscape' : 'portrait' });
    const now = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.setFontSize(16);
    doc.setTextColor(30, 30, 60);
    doc.text('CodeLAB - Reporte de Inventario', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 120);
    doc.text(`Fecha: ${now}`, 14, 26);
    doc.text(`Total de registros: ${rows.length}`, 14, 32);

    if (sql) {
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 100);
      const sqlLines = doc.splitTextToSize(`SQL: ${sql}`, 265);
      doc.text(sqlLines, 14, 38);
    }

    const tableBody = rows.map(row =>
      columns.map(col => {
        const v = row[col];
        if (v === null || v === undefined) return '';
        if (col === 'precio') return `S/. ${Number(v).toFixed(2)}`;
        return String(v);
      })
    );

    autoTable(doc, {
      head: [columns],
      body: tableBody,
      startY: sql ? 48 : 40,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      margin: { left: 14, right: 14 },
    });

    doc.save('inventario_reporte.pdf');
  };

  return (
    <div className="export-section">
      <button className="btn btn-secondary btn-sm" onClick={exportCSV} title="Descargar como CSV">
        ⬇ CSV
      </button>
      <button className="btn btn-secondary btn-sm" onClick={exportPDF} title="Descargar como PDF">
        ⬇ PDF
      </button>
    </div>
  );
}
