# Main Account Filter Feature

## Overview
The **Main Account** filter provides an account-centric view of all transactions. When an account is selected, all Credit (C), Debit (D), and Loan (CD) transactions are displayed **from that account's perspective**.

## How It Works

### Core Concept
**Perspective-Based Display**: The C/D column dynamically changes based on the selected Main Account to show whether money is **coming in (Credit)** or **going out (Debit)** from that account's viewpoint.

### Example Scenario
**Transaction:** Rupa CA → Cash for TD (₹5,000)
**Original C/D:** D (Debit in system)

#### **When Main Account = Rupa CA**
- **Display**: `D` (Debit - Red color)
- **Amount**: ₹5,000 (red)
- **Meaning**: Money going OUT from Rupa CA
- **Summary**: Debit = ₹5,000, Net Balance = -₹5,000

#### **When Main Account = Cash for TD**
- **Display**: `C` (Credit - Green color)
- **Amount**: ₹5,000 (green)
- **Meaning**: Money coming IN to Cash for TD
- **Summary**: Credit = ₹5,000, Net Balance = +₹5,000

#### **When No Main Account Selected**
- **Display**: `D` (Original value)
- **Meaning**: System's default classification

## Features

### 1. All Transaction Types Included
- **Credit (C)** transactions
- **Debit (D)** transactions
- **Loan (CD)** transactions
All are displayed and classified from the selected account's perspective.

### 2. Dynamic C/D Display
The C/D column automatically adjusts:
- **Green C**: Money coming into the main account
- **Red D**: Money going out of the main account
- **Blue CD**: Loan transactions (if applicable)

### 3. Smart Summary Calculation
- **Excludes CD (Loan) transactions** from net balance
- Calculates Credit/Debit based on account perspective
- Net Balance = Credit - Debit (from account's viewpoint)

### 4. Filter Combination
Main Account filter works alongside other filters:
- Date range filters
- C/D type filters
- Main Header filters
- Code filters

## Usage

### Step 1: Select Main Account
1. Go to **Financial Reports**
2. Open **Filters Panel**
3. Select an account from **Main Account** dropdown
4. All transactions involving that account will appear

### Step 2: View Transactions
- C/D column shows perspective from selected account
- Green amounts = Money received
- Red amounts = Money paid out
- Summary totals reflect account's position

### Step 3: Analyze Balance
- **Credit Total**: All money received by this account
- **Debit Total**: All money paid by this account
- **Net Balance**: Credit - Debit (excludes CD/Loans)

## Examples

### Example 1: Bank Account Analysis
**Main Account:** SBI CA

**Transactions:**
| From Account | To Account | Amount | Display C/D | Color |
|--------------|------------|--------|-------------|-------|
| Rupa CA | SBI CA | ₹10,000 | C | Green |
| SBI CA | Vendor | ₹5,000 | D | Red |
| Cash TD | SBI CA | ₹3,000 | C | Green |

**Summary:**
- Credit: ₹13,000 (money received)
- Debit: ₹5,000 (money paid)
- Net: +₹8,000 (positive balance)

### Example 2: Cash Account Tracking
**Main Account:** Cash for TD

**Transactions:**
| From Account | To Account | Amount | Display C/D | Color |
|--------------|------------|--------|-------------|-------|
| SBI CA | Cash TD | ₹15,000 | C | Green |
| Cash TD | Expenses | ₹8,000 | D | Red |
| Cash TD | Vendor | ₹2,000 | D | Red |

**Summary:**
- Credit: ₹15,000 (cash received)
- Debit: ₹10,000 (cash paid)
- Net: +₹5,000 (cash on hand)

### Example 3: Multiple Account Types
**Main Account:** Rupa CA

**Transactions:**
| From | To | Amount | Type | Display C/D |
|------|-----|--------|------|-------------|
| Rupa CA | Cash TD | ₹5,000 | D | D (Red) |
| SBI CA | Rupa CA | ₹10,000 | C | C (Green) |
| Rupa CA | SBI CA | ₹3,000 | CD (Loan) | D (Red) |

**Summary:**
- Credit: ₹10,000 (money received)
- Debit: ₹5,000 (money paid - CD excluded)
- Net: +₹5,000

## Technical Implementation

### Dynamic C/D Logic
```javascript
if (mainAccountFilter) {
  if (transaction.toAccount === mainAccountFilter) {
    return 'C'; // Money coming in = Credit
  }
  if (transaction.fromAccount === mainAccountFilter) {
    return 'D'; // Money going out = Debit
  }
}
```

### Summary Calculation
```javascript
// Credit: All money received by main account (excluding CD)
const totalCredit = transactions.reduce((acc, r) => {
  if (r.cd === 'CD') return acc; // Exclude loans
  if (r.toAccount === mainAccountFilter) {
    return acc + amount; // Money coming in
  }
  return acc;
}, 0);

// Debit: All money paid by main account (excluding CD)
const totalDebit = transactions.reduce((acc, r) => {
  if (r.cd === 'CD') return acc; // Exclude loans
  if (r.fromAccount === mainAccountFilter) {
    return acc + amount; // Money going out
  }
  return acc;
}, 0);
```

## Benefits

### 1. Account-Centric View
View all activity for a specific account in one place

### 2. Intuitive Understanding
C/D display matches how you naturally think about account flow:
- Credits = Money received
- Debits = Money paid

### 3. Accurate Balance Tracking
Net balance shows the actual financial position of the account

### 4. Bank Reconciliation
Easily match with bank statements where:
- Credits = Deposits
- Debits = Withdrawals

### 5. Cash Flow Analysis
Track cash inflows and outflows per account

### 6. Loan Exclusion
CD transactions displayed but excluded from net balance to avoid double-counting

## Difference from Other Filters

### Main Account vs From Account
- **Main Account**: Shows ALL transactions (from + to) with perspective
- **From Account**: Shows only transactions WHERE account is sender

### Main Account vs To Account
- **Main Account**: Shows ALL transactions (from + to) with perspective
- **To Account**: Shows only transactions WHERE account is receiver

### Main Account vs C/D Filter
- **Main Account**: Changes C/D display based on perspective
- **C/D Filter**: Filters transactions by original C/D type

## Use Cases

### Use Case 1: Daily Cash Position
- Select "Cash for TD" as Main Account
- View Credit (cash in) vs Debit (cash out)
- Check Net Balance for available cash

### Use Case 2: Bank Statement Reconciliation
- Select bank account as Main Account
- Compare displayed transactions with bank statement
- Credits should match deposits, Debits should match withdrawals

### Use Case 3: Vendor Account Analysis
- Select vendor account as Main Account
- Track payments made (Debit) and received (Credit)
- Monitor outstanding balance

### Use Case 4: Monthly Account Review
- Select account to review
- Add date range filter
- Analyze monthly inflows and outflows

## Notes

- **CD (Loan) transactions** are shown but NOT included in net balance calculation
- **Original C/D values** are preserved in database
- **Display only** changes based on perspective
- **Compatible** with all existing filters
