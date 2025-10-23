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

// Helper function to create a single sheet with data
function createSheetWithData(wb, sheetName, rows, username, now, monthName, timestamp) {
  const ws = wb.addWorksheet(sheetName, { properties: { defaultRowHeight: 18 } });

  // Column widths
  ws.columns = [
    { header: 'Code', key: 'code', width: 16 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'From Account', key: 'fromAccount', width: 20 },
    { header: 'To Account', key: 'toAccount', width: 20 },
    { header: 'C/D', key: 'cd', width: 8 },
    { header: 'Main Header', key: 'mainHeader', width: 20 },
    { header: 'Sub Header', key: 'subHeader', width: 40 },
    { header: 'Amount', key: 'amount', width: 14 }
  ];

  // Top banner
  ws.mergeCells('A1:D1');
  ws.getCell('A1').value = `Name of Month : ${monthName}`;
  ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };
  ws.getCell('A1').font = { bold: true };
  ws.getCell('A1').alignment = { vertical: 'middle' };

  ws.mergeCells('E1:H1');
  ws.getCell('E1').value = 'FINANCIAL REPORT';
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

  ws.mergeCells('E2:H2');
  ws.getCell('E2').value = sheetName === 'All Accounts' ? 'ALL TRANSACTIONS' : sheetName.toUpperCase();
  ws.getCell('E2').alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getCell('E2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.black } };
  ws.getCell('E2').font = { bold: true, color: { argb: COLORS.white } };

  // Section headers
  ws.mergeCells('A3:E3');
  ws.getCell('A3').value = 'Transaction Details';
  ws.getCell('A3').alignment = { horizontal: 'center' };
  ws.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };

  ws.mergeCells('F3:H3');
  ws.getCell('F3').value = 'Headers & Amount';
  ws.getCell('F3').alignment = { horizontal: 'center' };
  ws.getCell('F3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };

  // Helper function to get dynamic C/D based on sheet (account) perspective
  const getDynamicCD = (transaction, accountName) => {
    // For "All Accounts" sheet, use original C/D
    if (accountName === 'All Accounts') return transaction.cd;
    
    // For account-specific sheets, show perspective from that account
    // If account is receiving (toAccount), it's a Credit for them
    if (transaction.toAccount === accountName) {
      return 'C';
    }
    
    // If account is giving (fromAccount), it's a Debit for them
    if (transaction.fromAccount === accountName) {
      return 'D';
    }
    
    // Default to original
    return transaction.cd;
  };

  // Summary band (row 4) - using dynamic C/D
  const creditTotal = rows.reduce((a, r) => {
    const dynamicCD = getDynamicCD(r, sheetName);
    return a + (dynamicCD === 'C' ? Number(r.amount || 0) : 0);
  }, 0);
  const debitTotal = rows.reduce((a, r) => {
    const dynamicCD = getDynamicCD(r, sheetName);
    return a + (dynamicCD === 'D' ? Number(r.amount || 0) : 0);
  }, 0);
  const netTotal = creditTotal - debitTotal;

  ws.mergeCells('A4:B4'); ws.getCell('A4').value = `CREDIT: ${creditTotal.toLocaleString()}`; ws.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.credit } }; ws.getCell('A4').font = { bold: true, color: { argb: COLORS.white } }; ws.getCell('A4').alignment = { horizontal: 'center' };
  ws.mergeCells('C4:E4'); ws.getCell('C4').value = `DEBIT: ${debitTotal.toLocaleString()}`; ws.getCell('C4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.debit } }; ws.getCell('C4').font = { bold: true, color: { argb: COLORS.white } }; ws.getCell('C4').alignment = { horizontal: 'center' };
  ws.mergeCells('F4:H4'); ws.getCell('F4').value = `NET: ${netTotal.toLocaleString()}`; ws.getCell('F4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } }; ws.getCell('F4').font = { bold: true, color: { argb: COLORS.white } }; ws.getCell('F4').alignment = { horizontal: 'center' };

  // Column header row
  const headerRow = ws.addRow(['Code', 'Date', 'From Account', 'To Account', 'C/D', 'Main Header', 'Sub Header', 'Amount']);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenRow } };
    cell.font = { bold: true, color: { argb: COLORS.black } };
    setBorder(cell);
    cell.alignment = { horizontal: 'center' };
  });

  // Data rows
  rows.forEach((r) => {
    const amount = Number(r.amount || 0);
    const dynamicCD = getDynamicCD(r, sheetName);
    const row = ws.addRow([r.code, r.date, r.fromAccount, r.toAccount, dynamicCD, r.mainHeader, r.subHeader, amount]);
    row.eachCell((cell, col) => {
      setBorder(cell);
      if (col === 5) { // C/D column
        cell.font = { color: { argb: dynamicCD === 'C' ? 'FF0B8A00' : 'FFB91C1C' }, bold: true };
        cell.alignment = { horizontal: 'center' };
      }
      if (col === 8) { // Amount column
        cell.font = { color: { argb: dynamicCD === 'C' ? 'FF0B8A00' : 'FFB91C1C' }, bold: true };
        cell.numFmt = '#,##0.00';
      }
      if (col === 2) cell.numFmt = 'dd-mm-yyyy';
    });
  });

  // Footer meta
  const metaStart = ws.rowCount + 2;
  ws.mergeCells(`A${metaStart}:H${metaStart}`);
  ws.getCell(`A${metaStart}`).value = `Downloaded: ${timestamp} | By: ${username}`;
  ws.getCell(`A${metaStart}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };
}

export default async function exportFinancialDataToExcelStyled({ rows = [], user = {}, filters = {} }) {
  const username = user?.name || user?.username || 'Unknown';
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const timestamp = now.toLocaleString();

  const wb = new ExcelJS.Workbook();
  
  // Get all unique account names
  const accountsSet = new Set();
  rows.forEach(row => {
    if (row.fromAccount) accountsSet.add(row.fromAccount);
    if (row.toAccount) accountsSet.add(row.toAccount);
  });
  const accounts = Array.from(accountsSet).sort();
  
  // Create a sheet for each account
  accounts.forEach(account => {
    // Filter rows where this account is involved (either from or to)
    const accountRows = rows.filter(row => 
      row.fromAccount === account || row.toAccount === account
    );
    
    if (accountRows.length > 0) {
      // Sanitize sheet name (Excel has restrictions: max 31 chars, no special chars)
      const sanitizedName = account.substring(0, 31).replace(/[\\/*?:\[\]]/g, '_');
      createSheetWithData(wb, sanitizedName, accountRows, username, now, monthName, timestamp);
    }
  });
  
  // Create an "All Accounts" summary sheet at the end
  if (rows.length > 0) {
    createSheetWithData(wb, 'All Accounts', rows, username, now, monthName, timestamp);
  }

  // File
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `FinancialReport_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
