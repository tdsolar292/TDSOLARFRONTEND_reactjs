# Loan Transaction Directional Symbols Feature

## Overview
Added visual directional indicators (+/- symbols with arrows) for loan (CD) transactions to show the flow of money between accounts based on the selected account perspective.

## How It Works

### Example Scenario
**Rupa CA gives loan ₹5,000 to SBI CA**
- Transaction: From Account = "Rupa CA", To Account = "SBI CA", CD = "CD", Amount = 5000

### When Viewing by Account Filter

#### 1. **SBI CA Account (Receiving Loan)**
- Display: `↓ +₹5,000` (Green color)
- Meaning: Money received (incoming loan)
- Symbol: Down arrow + Plus sign

#### 2. **Rupa CA Account (Giving Loan)**
- Display: `↑ -₹5,000` (Red color)
- Meaning: Money given out (outgoing loan)
- Symbol: Up arrow + Minus sign

#### 3. **No Account Filter**
- Display: `₹5,000 →` (Blue color)
- Meaning: Neutral view showing transaction exists

## Visual Elements

### Icons Used
- **↓ (bi-arrow-down-circle)**: Money coming in/received
- **↑ (bi-arrow-up-circle)**: Money going out/given
- **→ (bi-arrow-right)**: Neutral flow indicator

### Color Coding
- **Green** (`amount-loan-positive`): Positive balance impact (money received)
- **Red** (`amount-loan-negative`): Negative balance impact (money given)
- **Blue** (`amount-loan`): Neutral (no account context)

## Implementation Details

### Functions Added
1. **`formatLoanAmount(item, amount)`**: Formats the amount with directional symbols and icons
2. **`getLoanAmountClass(item)`**: Returns appropriate CSS class based on direction

### Logic
- Checks if transaction is CD (loan) type
- Compares filtered account with `fromAccount` and `toAccount`
- If filtered account matches `toAccount` → Positive (+) with down arrow
- If filtered account matches `fromAccount` → Negative (-) with up arrow
- No filter → Neutral display with right arrow

## User Interface

### Table Column Header
- Added info icon (ℹ️) next to "Amount" column header
- Tooltip: "Loan transactions: ↓+ (received) | ↑- (given out)"

### Filter Requirements
- Works when **From Account** OR **To Account** filter is selected
- Best used in conjunction with **C/D filter = CD** (Loan)

## Benefits
1. **Clear Direction**: Instantly understand money flow direction
2. **Account Perspective**: View from specific account's point of view
3. **Visual Clarity**: Color-coded for quick comprehension
4. **Intuitive Icons**: Universal arrow symbols for in/out flow
5. **Consistent UX**: Matches credit (green) and debit (red) color scheme

## Usage Example

### Step-by-Step
1. Go to **Financial Reports** → **Credit & Debit Acc** tab
2. Select **SBI CA** from "From Account" or "To Account" filter
3. Select **CD** from "C/D" filter (optional but recommended)
4. View loan transactions with directional symbols:
   - Loans received by SBI CA: Green with ↓ +₹5,000
   - Loans given by SBI CA: Red with ↑ -₹5,000

## Technical Notes
- CSS classes: `amount-loan-positive`, `amount-loan-negative`, `amount-loan`
- Bootstrap Icons library used for arrow symbols
- Compatible with existing export and filtering features
