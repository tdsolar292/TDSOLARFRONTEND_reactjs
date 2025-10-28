// Centralized dropdown configuration for Financial Reports
// Update the arrays below to control dropdown values.
// If an array is left empty, the UI will fall back to values derived from API data.

const financialReportConfig = {
  // Code types for the code dropdown
  codeTypes: [
    { value: 'Lp', label: 'Lp' },
    { value: 'Sc', label: 'Sc' },
    { value: 'COMPANY-', label: 'COMPANY-' },
    { value: 'PERSON-', label: 'PERSON-' },
    { value: 'SELF', label: 'SELF' },
    { value: 'UNSECURE LOAN', label: 'UNSECURE LOAN' },
    { value: 'UNSECURE LOAN PAYMENT', label: 'UNSECURE LOAN PAYMENT' },
    { value: 'SECURE LOAN', label: 'SECURE LOAN' },
    { value: 'SECURE LOAN PAYMENT', label: 'SECURE LOAN PAYMENT' },
    { value: 'OTHER', label: 'OTHER' }
  ],

  // Account names for fromAccount and toAccount dropdowns
  // If you change anything here the same will change automatically in Payment Receipt page 
  accountNames: [
    'NA',
    'HDFC CREDIT CARD',
    'INDUSLND BANK CREDIT CARD',
    'PAYTM',
    'CASH FOR TD',
    'SBI SA',
    'SBI SA PPF',
    'SBI SA CREDIT CARD',
    'SBI OD',
    'SBI TD CA',
    'HDFC HOME LOAN',
    'HDFC HOME LOAN INSURANCE',
    'RUPA CA',
    'PNB SA',
    'PNB APY',
    'PNB SSA',
    'LIC 3215',
    'LIC 7000',
    'ICICI SA',
    'C/A FD-250000',
    'SOURAV SA',
  ],

  // Credit/Debit options
  creditDebitOptions: [
    { value: 'C', label: 'Credit' },
    { value: 'D', label: 'Debit' }
  ],

  // Main header categories for Debit (D)
  mainHeadersDebit: [
    'MATERIALS_TYPES OF INSTRUMENTS',
    'MATERIALS_ELECTRICAL RELATED ITEMS',
    'MATERIALS_CIVIL ITEMS',
    'MATERIALS_OTHERS',
    'OFFICE EXPENCES_UTILITIES_BILL PAYMENT',
    'OFFICE EXPENCES_MARKITING AND ADVERTISING_ALL',
    'OFFICE EXPENCES_PAYROLL AND WAGE_MEDICAL',
    'OFFICE EXPENCES_PAYROLL AND WAGE_ADVANCE',
    'OFFICE EXPENCES_PAYROLL AND WAGE_SALARY',
    'OFFICE EXPENCES_PAYROLL AND WAGE_INCENTIVE',
    'OFFICE EXPENCES_PAYROLL AND WAGE_RENT CHARGES',
    'OFFICE EXPENCES_PAYROLL AND WAGE_FUEL',
    'OFFICE EXPENCES_PAYROLL AND WAGE_RECHARGE',
    'OFFICE EXPENCES_PAYROLL AND WAGE_ENTERTAINMENT',
    'OFFICE EXPENCES_DIRECT LABOUR_LABOUR CHARGES',
    'OFFICE EXPENCES_DIRECT LABOUR_HIRING OF MANPOWER',
    'OFFICE EXPENCES_DIRECT LABOUR_TRANSPORTATION',
    'OFFICE EXPENCES_DONATION',
    'OFFICE EXPENCES_LOAN',
    'OFFICE EXPENCES_URGENT MONEY TO EVERYONE',
    'OFFICE EXPENCES_LOAN RE-PAYMENT',
    'OFFICE EXPENCES_PROFESSIONAL FEES',
    'OFFICE EXPENCES_OTHERS',
    'GOVERNMENT PAYMENT_GRIPS',
    'GOVERNMENT PAYMENT_STAMP DUTY',
    'GOVERNMENT PAYMENT_ANY TAXES',
    'GOVERNMENT PAYMENT_OTHERS',
    'INSURANCE_FOR BUSINESS',
    'INVESTMENT(ALL TYPES)',
    'RETURNED AGAINST ALL CONDITION',
    'SELF TRANSFER',
    'CASH WITHDRAWAL'
  ],

  // Main header categories for Credit (C)
  mainHeadersCredit: [
    'PAYMENT AGAINST SOLAR INSTALLATION',
    'PAYMENT AGAINST CONSULTANCY',
    'PAYMENT AGAINST CIVIL MATTERS',
    'CASH DEPOSIT'
  ],
};

export default financialReportConfig;
