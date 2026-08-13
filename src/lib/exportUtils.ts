// Export utilities for Excel (CSV UTF-8) and PDF Printable Reports for Camila

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number;
}

/**
 * Generates and triggers download of an Excel-compatible CSV file with UTF-8 BOM
 */
export function exportToCSV<T>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[],
) {
  if (!data || data.length === 0) {
    alert("No hay datos disponibles para exportar.");
    return;
  }

  // Header line
  const headers = columns
    .map((c) => `"${c.header.replace(/"/g, '""')}"`)
    .join(",");

  // Data lines
  const rows = data.map((item) => {
    return columns
      .map((c) => {
        const val = c.accessor(item);
        const strVal = val === null || val === undefined ? "" : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  const csvContent = [headers, ...rows].join("\r\n");

  // UTF-8 BOM for Microsoft Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats data into a printable HTML document designed for browser PDF generation & direct printing
 */
export function printReport<T>(
  title: string,
  subtitle: string,
  columns: ExportColumn<T>[],
  data: T[],
  summaryCards?: { label: string; value: string }[],
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert(
      "Por favor habilita las ventanas emergentes (popups) para exportar el reporte en PDF.",
    );
    return;
  }

  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const summaryHtml = summaryCards
    ? `
    <div style="display: flex; gap: 16px; margin-bottom: 24px;">
      ${summaryCards
        .map(
          (c) => `
        <div style="flex: 1; background: #f4f4f5; padding: 12px 16px; border-radius: 8px; border: 1px solid #e4e4e7;">
          <div style="font-size: 10px; font-weight: bold; color: #71717a; text-transform: uppercase;">${c.label}</div>
          <div style="font-size: 18px; font-weight: 900; color: #09090b; margin-top: 4px;">${c.value}</div>
        </div>
      `,
        )
        .join("")}
    </div>`
    : "";

  const tableHeaderHtml = columns
    .map(
      (c) =>
        `<th style="padding: 10px 12px; text-align: left; background: #18181b; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase;">${c.header}</th>`,
    )
    .join("");

  const tableRowsHtml = data
    .map(
      (item, idx) => `
    <tr style="background: ${idx % 2 === 0 ? "#ffffff" : "#fafafa"}; border-bottom: 1px solid #e4e4e7;">
      ${columns
        .map(
          (c) => `
        <td style="padding: 10px 12px; font-size: 11px; color: #27272a;">${c.accessor(item)}</td>
      `,
        )
        .join("")}
    </tr>`,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title} — Isafer Boutique</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 24px;
          color: #18181b;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f43f5e;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 20px;
          font-weight: 900;
          color: #f43f5e;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .title {
          font-size: 18px;
          font-weight: 800;
          margin-top: 4px;
        }
        .subtitle {
          font-size: 12px;
          color: #71717a;
        }
        .date {
          font-size: 11px;
          color: #71717a;
          text-align: right;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 12px;
          border-top: 1px solid #e4e4e7;
          font-size: 10px;
          color: #a1a1aa;
          text-align: center;
        }
        .btn-print {
          background: #f43f5e;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">Isafer Boutique 💖</div>
          <div class="title">${title}</div>
          <div class="subtitle">${subtitle}</div>
        </div>
        <div>
          <div class="date">Generado el: ${currentDate}</div>
          <div class="no-print" style="margin-top: 8px; text-align: right;">
            <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
          </div>
        </div>
      </div>

      ${summaryHtml}

      <table>
        <thead>
          <tr>${tableHeaderHtml}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <div class="footer">
        Reporte Oficial para Camila — Isafer Boutique NYC • Documento Confidencial
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
