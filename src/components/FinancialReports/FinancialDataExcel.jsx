import ExcelJS from "exceljs";

const COLORS = {
  yellow: 'FFF7E600',
  black: 'FF111111',
  white: 'FFFFFFFF',
  greenRow: 'FFB9F3EA',
  credit: 'FF22C55E',
  debit: 'FFEF4444',
  primary: 'FF2563EB'
};

function setBorder(cell) {
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFBBBBBB' } },
    left: { style: 'thin', color: { argb: 'FFBBBBBB' } },
    bottom: { style: 'thin', color: { argb: 'FFBBBBBB' } },
    right: { style: 'thin', color: { argb: 'FFBBBBBB' } }
  };
}

export default async function exportFinancialDataToExcelStyled({ rows = [], user = {}, filters = {} }) {
  const username = user?.name || user?.username || 'Unknown';
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const timestamp = now.toLocaleString();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('BALANCE SHEET', { properties: { defaultRowHeight: 18 } });

  // Column widths
  ws.columns = [
    { header: 'Code', key: 'code', width: 16 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Mode', key: 'mode', width: 16 },
    { header: 'Head of Account', key: 'head', width: 20 },
    { header: 'Description for Transaction', key: 'desc', width: 56 },
    { header: 'CREDIT', key: 'credit', width: 12 },
    { header: 'DEBIT', key: 'debit', width: 12 }
  ];

  // Top banner
  ws.mergeCells('A1:D1');
  ws.getCell('A1').value = `Name of Month : ${monthName}`;
  ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };
  ws.getCell('A1').font = { bold: true };
  ws.getCell('A1').alignment = { vertical: 'middle' };

  ws.mergeCells('E1:G1');
  ws.getCell('E1').value = 'BALANCE SHEET';
  ws.getCell('E1').font = { bold: true, size: 20 };
  ws.getCell('E1').alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A2:B2');
  ws.getCell('A2').value = 'FY2025-26';
  ws.getCell('A2').alignment = { horizontal: 'center' };
  ws.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };

  ws.mergeCells('C2:D2');
  ws.getCell('C2').value = 'Page No. 1';
  ws.getCell('C2').alignment = { horizontal: 'center' };
  ws.getCell('C2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };

  ws.mergeCells('E2:G2');
  ws.getCell('E2').value = filters.account || 'ALL ACCOUNTS';
  ws.getCell('E2').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('E2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.black } };
  ws.getCell('E2').font = { bold: true, color: { argb: COLORS.white } };

  // Section headers
  ws.mergeCells('A3:D3');
  ws.getCell('A3').value = 'Details of Transaction';
  ws.getCell('A3').alignment = { horizontal: 'center' };
  ws.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };

  ws.mergeCells('E3:G3');
  ws.getCell('E3').value = 'Description for Transaction';
  ws.getCell('E3').alignment = { horizontal: 'center' };
  ws.getCell('E3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };

  // Summary band (row 4)
  const creditTotal = rows.reduce((a, r) => a + (r.transactionType === 'Credit' ? Number(r.amount || 0) : 0), 0);
  const debitTotal = rows.reduce((a, r) => a + (r.transactionType === 'Debit' ? Number(r.amount || 0) : 0), 0);
  const netTotal = creditTotal - debitTotal;

  ws.mergeCells('A4:B4'); ws.getCell('A4').value = `CREDIT: ${creditTotal.toLocaleString()}`; ws.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.credit } }; ws.getCell('A4').font = { bold: true, color: { argb: COLORS.white } }; ws.getCell('A4').alignment = { horizontal: 'center' };
  ws.mergeCells('C4:D4'); ws.getCell('C4').value = `DEBIT: ${debitTotal.toLocaleString()}`; ws.getCell('C4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.debit } }; ws.getCell('C4').font = { bold: true, color: { argb: COLORS.white } }; ws.getCell('C4').alignment = { horizontal: 'center' };
  ws.mergeCells('E4:G4'); ws.getCell('E4').value = `NET: ${netTotal.toLocaleString()}`; ws.getCell('E4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } }; ws.getCell('E4').font = { bold: true, color: { argb: COLORS.white } }; ws.getCell('E4').alignment = { horizontal: 'center' };

  // Column header row
  const headerRow = ws.addRow(['Code', 'Date', 'Mode', 'Head of Account', 'Description for Transaction', 'CREDIT', 'DEBIT']);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenRow } };
    cell.font = { bold: true, color: { argb: COLORS.black } };
    setBorder(cell);
    cell.alignment = { horizontal: 'center' };
  });

  // Data rows
  rows.forEach((r) => {
    const credit = r.transactionType === 'Credit' ? Number(r.amount || 0) : 0;
    const debit = r.transactionType === 'Debit' ? Number(r.amount || 0) : 0;
    const row = ws.addRow([r.code, r.date, r.accountMode, r.headOfAccount, r.description, credit, debit]);
    row.eachCell((cell, col) => {
      setBorder(cell);
      if (col === 6) cell.font = { color: { argb: 'FF0B8A00' }, bold: true };
      if (col === 7) cell.font = { color: { argb: 'FFB91C1C' }, bold: true };
      if (col >= 6) cell.numFmt = '#,##0.00';
      if (col === 2) cell.numFmt = 'dd-mm-yyyy';
    });
  });

  // Footer meta
  const metaStart = ws.rowCount + 2;
  ws.mergeCells(`A${metaStart}:D${metaStart}`);
  ws.getCell(`A${metaStart}`).value = `Downloaded: ${timestamp} | By: ${username}`;
  ws.getCell(`A${metaStart}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };

  // File
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BalanceSheet_${filters.account || 'All'}_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
