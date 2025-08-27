// Centralized dropdown configuration for Financial Reports
// Update the arrays below to control dropdown values.
// If an array is left empty, the UI will fall back to values derived from API data.

const financialReportConfig = {
  // Set explicit codes to show in the Code datalist. Example: ["TRX-001", "TRX-002"]
  codes: [],

  // Set explicit modes to show in the Mode dropdown. Example: ["Cash", "Bank", "UPI", "Card"]
  baseAccountNames: [
    'HDFC CREDIT CARD',
    'INDUSLND BANK CREDIT CARD',
    'PAYTM',
    'CASH',
    'SBI SA',
    'SBI SA PPF',
    'SBI SA CREDIT CARD',
    'HDFC HOME LOAN',
    'HDFC HOME LOAN INSURANCE',
    'SBI CA',
    'PNB SA',
    'PNB APY',
    'PNB SSA',
    'LIC 3215',
    'LIC 7000',
    'ICICI SA',
    'RUPA CA',
    'C/A FD-250000',
  ],

  // Set explicit heads to show in the Head dropdown. Example: ["Sales", "Purchase", "Salary", "Rent"]
  heads: [
    'Sales Revenue',
    'Purchase Expenses',
    'Salary Expenses',
    'Rent Expenses',
    'Utility Expenses',
    'Marketing Expenses',
    'Travel Expenses',
    'Office Supplies',
    'Insurance',
    'Taxes',
    'Interest Income',
    'Investment Income',
    'Other Income',
    'Other Expenses'
  ],

  // Transaction types used in AddFinancialDataModal select
  transactionTypes: [
    { value: 'Credit', label: 'Credit' },
    { value: 'Debit', label: 'Debit' }
  ],

  // Code prefixes used in AddFinancialDataModal select
  codePrefixes: [
    { value: 'Sc', label: 'Sc' },
    { value: 'Lp', label: 'Lp' },
    { value: 'PER', label: 'PER' },
    { value: 'COM', label: 'COM' }
  ],
};

export default financialReportConfig;
