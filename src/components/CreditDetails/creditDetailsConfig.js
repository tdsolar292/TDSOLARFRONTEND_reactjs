// Centralized dropdown configuration for Credit Details module
// Edit these arrays to control the options shown in the Add/Edit credit modals.
// If an array is left empty, components will fall back to their current hardcoded defaults.

const creditDetailsConfig = {
  // Account names used in the Account Name select
  accountNames: [
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

  // Credit Heads used in the Head select
  creditHeads: [
    'BLANK',
    'CASH',
    'Credit',
    'D/C',
    'DEPOSIT BY ME',
    'INTEREST',
    'INVESTMENT',
    'RECEIVED',
    'RECEIVED+G1370',
    'OTHERS',
  ],

  // Optional: Transaction types if you want a dropdown instead of free text
  transactionTypes: [],
};

export default creditDetailsConfig;
