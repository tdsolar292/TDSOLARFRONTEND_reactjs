/**
 * AddFinancialDataModal Component - Unit Tests
 *
 * Test Coverage:
 * 1. Renders in Add mode with required fields
 * 2. Renders in Edit mode and pre-populates form from editData (codeType + codeNumber split)
 * 3. Shows code suggestions based on allData and selected codeType, and can select a suggestion
 * 4. Conditionally renders Meter Reading when mainHeader includes 'WAGE_FUEL'
 * 5. Submits new record (POST) with correct payload
 * 6. Updates existing record (PUT) with correct payload and tracking fields
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddFinancialDataModal from './AddFinancialDataModal';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock config
vi.mock('../../config', () => ({
  default: { MernBaseURL: 'http://localhost:5000/api' }
}));

// Mock auth
vi.mock('../../auth', () => ({
  useAuth: () => ({ user: { username: 'tester', role: 'admin' } })
}));

// Mock financialReportConfig (centralized dropdown options)
vi.mock('./financialReportConfig', () => ({
  default: {
    codeTypes: [
      { value: 'COMPANY-', label: 'COM - Company' },
      { value: 'PER', label: 'PER - Personal' },
      { value: 'Sc', label: 'Sc - Sales Code' }
    ],
    accountNames: ['SBI TD CA', 'RUPA CA', 'NA', 'CASH FOR TD'],
    creditDebitOptions: [
      { value: 'C', label: 'Credit' },
      { value: 'D', label: 'Debit' }
    ],
    mainHeadersCredit: [
      'PAYMENT AGAINST SOLAR INSTALLATION'
    ],
    mainHeadersDebit: [
      'OFFICE EXPENCES_PAYROLL AND WAGE_FUEL',
      'MATERIALS_CIVIL ITEMS'
    ]
  }
}));

const selectByLabel = async (labelText, value) => {
  const label = await screen.findByText(labelText);
  const select = label.closest('.mb-3')?.querySelector('select');
  if (!select) throw new Error(`Select for label ${labelText} not found`);
  fireEvent.change(select, { target: { value } });
  return select;
};

const inputByLabel = async (labelText) => {
  const label = await screen.findByText(labelText);
  const input = label.closest('.mb-3')?.querySelector('input');
  if (!input) throw new Error(`Input for label ${labelText} not found`);
  return input;
};

describe('AddFinancialDataModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.post.mockResolvedValue({ data: { message: 'Created' } });
    axios.put.mockResolvedValue({ data: { message: 'Updated' } });
  });

  it('renders Add mode with required fields', () => {
    render(
      <AddFinancialDataModal
        editData={null}
        allData={[]}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('Add Financial Data')).toBeInTheDocument();
    // Required selects/inputs visible
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Code Type')).toBeInTheDocument();
    expect(screen.getByText('Code Number')).toBeInTheDocument();
    expect(screen.getByText('From Account')).toBeInTheDocument();
    expect(screen.getByText('To Account')).toBeInTheDocument();
    expect(screen.getByText('Credit/Debit')).toBeInTheDocument();
    expect(screen.getByText('Main Header')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders Edit mode and pre-populates fields from editData (codeType + codeNumber split)', async () => {
    const editData = {
      _id: 'abc123',
      date: '2025-10-28',
      code: 'COMPANY-XYZ',
      fromAccount: 'RUPA CA',
      throughBy: 'Bank',
      toAccount: 'NA',
      cd: 'D',
      mainHeader: 'MATERIALS_CIVIL ITEMS',
      meterReading: null,
      subHeader: 'Test edit',
      amount: 500
    };

    render(
      <AddFinancialDataModal
        editData={editData}
        allData={[]}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(await screen.findByText('Edit Financial Data')).toBeInTheDocument();

    // Code Type should be COMPANY-
    const codeTypeLabel = await screen.findByText('Code Type');
    const codeTypeSelect = codeTypeLabel.closest('.mb-3')?.querySelector('select');
    expect(codeTypeSelect).toHaveValue('COMPANY-');

    // Code Number should be XYZ
    const codeNumInput = await inputByLabel('Code Number');
    expect(codeNumInput).toHaveValue('XYZ');

    // Other fields
    const fromSelect = await selectByLabel('From Account', 'RUPA CA');
    expect(fromSelect).toHaveValue('RUPA CA');

    const toSelect = await selectByLabel('To Account', 'NA');
    expect(toSelect).toHaveValue('NA');

    const cdSelect = await selectByLabel('Credit/Debit', 'D');
    expect(cdSelect).toHaveValue('D');

    const mainHeaderSelect = await selectByLabel('Main Header', 'MATERIALS_CIVIL ITEMS');
    expect(mainHeaderSelect).toHaveValue('MATERIALS_CIVIL ITEMS');

    const amountInput = await inputByLabel('Amount');
    expect(amountInput).toHaveValue(500);
  });

  it('shows code suggestions for selected code type and allows selecting one', async () => {
    const allData = [
      { code: 'COMPANY-123' },
      { code: 'COMPANY-XYZ' },
      { code: 'PERABC' }
    ];

    render(
      <AddFinancialDataModal
        editData={null}
        allData={allData}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    // Select Code Type: COMPANY-
    await selectByLabel('Code Type', 'COMPANY-');

    // Focus Code Number to show suggestions
    const codeNumInput = await inputByLabel('Code Number');
    fireEvent.focus(codeNumInput);

    // Type to filter suggestions
    fireEvent.change(codeNumInput, { target: { value: 'X' } });

    // Expect suggestions dropdown and click item
    const dropdown = await screen.findByText(/suggestion/i);
    const container = dropdown.closest('.code-suggestions-dropdown');
    expect(container).toBeInTheDocument();

    const list = container?.querySelector('.suggestions-list');
    expect(list).toBeTruthy();
    const item = within(list).getByText('XYZ');
    fireEvent.click(item);

    // Input should now be filled with selected suggestion
    expect(codeNumInput).toHaveValue('XYZ');
  });

  it("conditionally renders 'Meter Readings' when mainHeader includes 'WAGE_FUEL'", async () => {
    render(
      <AddFinancialDataModal
        editData={null}
        allData={[]}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    // Choose Debit to enable main headers debit list
    await selectByLabel('Credit/Debit', 'D');

    // Select the fuel header
    await selectByLabel('Main Header', 'OFFICE EXPENCES_PAYROLL AND WAGE_FUEL');

    // Meter Readings input should appear
    expect(await screen.findByText('Meter Readings')).toBeInTheDocument();
  });

  it('submits new record (POST) with correct payload', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <AddFinancialDataModal
        editData={null}
        allData={[{ code: 'COMPANY-111' }]}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Fill required fields
    await selectByLabel('Code Type', 'COMPANY-');
    const codeNumInput = await inputByLabel('Code Number');
    fireEvent.change(codeNumInput, { target: { value: '123' } });

    await selectByLabel('From Account', 'RUPA CA');
    await selectByLabel('To Account', 'SBI TD CA');
    await selectByLabel('Credit/Debit', 'C');
    await selectByLabel('Main Header', 'PAYMENT AGAINST SOLAR INSTALLATION');

    const amountInput = await inputByLabel('Amount');
    fireEvent.change(amountInput, { target: { value: '2500' } });

    // Click Submit
    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    // Validate payload
    const [url, payload] = axios.post.mock.calls[0];
    expect(url).toBe('http://localhost:5000/api/financialData/add');
    expect(payload).toMatchObject({
      code: 'COMPANY-123',
      fromAccount: 'RUPA CA',
      toAccount: 'SBI TD CA',
      cd: 'C',
      mainHeader: 'PAYMENT AGAINST SOLAR INSTALLATION',
      amount: 2500
    });

    // onSuccess and onClose should be called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('updates existing record (PUT) with correct payload and tracking fields', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    const editData = {
      _id: 'id-999',
      date: '2025-10-28',
      code: 'COMPANY-OLD',
      fromAccount: 'NA',
      throughBy: '',
      toAccount: 'RUPA CA',
      cd: 'D',
      mainHeader: 'MATERIALS_CIVIL ITEMS',
      meterReading: null,
      subHeader: '',
      amount: 100
    };

    render(
      <AddFinancialDataModal
        editData={editData}
        allData={[{ code: 'COMPANY-OLD' }]}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Change amount
    const amountInput = await inputByLabel('Amount');
    fireEvent.change(amountInput, { target: { value: '150' } });

    // Click Update
    const updateBtn = await screen.findByRole('button', { name: 'Update' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
    });

    const [url, payload] = axios.put.mock.calls[0];
    expect(url).toBe('http://localhost:5000/api/financialData/update/id-999');
    expect(payload).toMatchObject({
      amount: 150,
      isUpdated: true,
      updatedBy: 'tester'
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
