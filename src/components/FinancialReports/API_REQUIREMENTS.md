# Financial Reports API Requirements

## Overview
This document outlines the API changes required to support Edit, Delete, and tracking functionality for Financial Reports.

---

## 1. Database Schema Updates

### Add New Fields to FinancialData Model/Schema

```javascript
{
  // Existing fields...
  code: String,
  date: String,
  fromAccount: String,
  toAccount: String,
  cd: String,  // 'C', 'D', or 'CD'
  mainHeader: String,
  subHeader: String,
  amount: Number,
  
  // Original creation tracking
  generatedBy: String,
  generatedAt: String,
  
  // NEW: Update tracking fields
  isUpdated: { type: Boolean, default: false },
  updatedBy: String,
  updatedAt: String,
  
  // NEW: Soft delete tracking fields
  isDeleted: { type: Boolean, default: false },
  deletedBy: String,
  deletedAt: String
}
```

---

## 2. API Endpoints to Implement/Update

### A. GET All Financial Data (Update Existing)
**Endpoint:** `GET /financialData/getAll`

**Changes Needed:**
- By default, **exclude deleted records** (`isDeleted: false`)
- Optionally accept query parameter `?includeDeleted=true` to show deleted records

**Response:**
```javascript
[
  {
    "_id": "60d5ec49f1b2c8b5e8f5c123",
    "code": "LS123",
    "date": "2025-10-21",
    "fromAccount": "SBI SA",
    "toAccount": "CASH FOR TD",
    "cd": "D",
    "mainHeader": "MATERIALS_TYPES OF INSTRUMENTS",
    "subHeader": "Solar Panels",
    "amount": 50000,
    "generatedBy": "admin",
    "generatedAt": "2025-10-21",
    "isUpdated": false,
    "isDeleted": false
  }
]
```

---

### B. UPDATE Financial Data (NEW)
**Endpoint:** `PUT /financialData/update/:id`

**Request Body:**
```javascript
{
  "code": "LS124",
  "date": "2025-10-21",
  "fromAccount": "SBI SA",
  "toAccount": "CASH FOR TD",
  "cd": "D",
  "mainHeader": "MATERIALS_TYPES OF INSTRUMENTS",
  "subHeader": "Updated description",
  "amount": 55000,
  "updatedBy": "admin",
  "updatedAt": "2025-10-21",
  "isUpdated": true
}
```

**Logic:**
1. Find record by `_id`
2. Update all fields from request body
3. Set `isUpdated: true`
4. Store `updatedBy` and `updatedAt`
5. Return updated record

**Response:**
```javascript
{
  "success": true,
  "message": "Financial data updated successfully",
  "data": { /* updated record */ }
}
```

**Error Handling:**
- 404: Record not found
- 400: Validation errors
- 403: Cannot update deleted records

---

### C. SOFT DELETE Financial Data (NEW)
**Endpoint:** `PUT /financialData/delete/:id`

**Note:** This is a **soft delete** using PUT (not DELETE method)

**Request Body:**
```javascript
{
  "deletedBy": "admin",
  "deletedAt": "2025-10-21"
}
```

**Logic:**
1. Find record by `_id`
2. Set `isDeleted: true`
3. Store `deletedBy` and `deletedAt`
4. **Do NOT physically delete** the record from database
5. Return success message

**Response:**
```javascript
{
  "success": true,
  "message": "Financial data marked as deleted successfully",
  "data": { /* deleted record with isDeleted: true */ }
}
```

**Error Handling:**
- 404: Record not found
- 400: Already deleted
- 500: Server error

---

## 3. Query Filters

### Update GET endpoint to support filtering:

**Example Queries:**
```
GET /financialData/getAll?includeDeleted=true
GET /financialData/getAll?isUpdated=true
GET /financialData/getAll?cd=CD
GET /financialData/getAll?fromAccount=SBI%20SA&toAccount=CASH
```

---

## 4. Validation Rules

### For UPDATE endpoint:
- All fields are optional except `_id`
- Validate `cd` is one of: 'C', 'D', 'CD'
- Validate `amount` is a positive number
- Validate `date` format (YYYY-MM-DD)
- Cannot update a deleted record

### For DELETE endpoint:
- Require `deletedBy` and `deletedAt`
- Cannot delete an already deleted record
- Cannot delete if record doesn't exist

---

## 5. Migration Script (Optional)

If you have existing data without the new fields, run a migration:

```javascript
// Migration script example
db.financialData.updateMany(
  { isUpdated: { $exists: false } },
  {
    $set: {
      isUpdated: false,
      isDeleted: false
    }
  }
);
```

---

## 6. Testing Checklist

### Update Functionality:
- [ ] Can update all fields successfully
- [ ] `isUpdated` flag is set to true
- [ ] `updatedBy` and `updatedAt` are stored
- [ ] Cannot update deleted records
- [ ] Validation works for invalid data

### Delete Functionality:
- [ ] Record is marked as deleted (not removed)
- [ ] `isDeleted` flag is set to true
- [ ] `deletedBy` and `deletedAt` are stored
- [ ] GET /getAll excludes deleted records by default
- [ ] Can retrieve deleted records with `?includeDeleted=true`
- [ ] Cannot delete already deleted records

### Data Integrity:
- [ ] Original data (`generatedBy`, `generatedAt`) is preserved
- [ ] Update history is tracked
- [ ] Delete history is tracked
- [ ] All existing endpoints still work

---

## 7. Example API Implementation (Node.js/Express)

### Update Endpoint:
```javascript
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if record exists and not deleted
    const existing = await FinancialData.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Record not found' });
    }
    if (existing.isDeleted) {
      return res.status(403).json({ message: 'Cannot update deleted record' });
    }

    // Update record
    const updated = await FinancialData.findByIdAndUpdate(
      id,
      { ...updateData, isUpdated: true },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

### Soft Delete Endpoint:
```javascript
router.put('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy, deletedAt } = req.body;

    // Check if record exists
    const existing = await FinancialData.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Record not found' });
    }
    if (existing.isDeleted) {
      return res.status(400).json({ message: 'Record already deleted' });
    }

    // Soft delete
    const deleted = await FinancialData.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedBy, deletedAt },
      { new: true }
    );

    res.json({ success: true, message: 'Deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

### Get All with Filters:
```javascript
router.get('/getAll', async (req, res) => {
  try {
    const { includeDeleted } = req.query;
    
    const filter = includeDeleted === 'true' ? {} : { isDeleted: { $ne: true } };
    
    const data = await FinancialData.find(filter).sort({ date: -1 });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

---

## 8. Frontend Integration Summary

The frontend is already configured to call these endpoints:

- **Add:** `POST /financialData/add` (existing)
- **Update:** `PUT /financialData/update/:id` (new)
- **Delete:** `PUT /financialData/delete/:id` (new)
- **Get All:** `GET /financialData/getAll` (update to filter deleted)

---

## Questions or Issues?

Contact the frontend developer for clarification on:
- Expected response formats
- Error handling requirements
- Additional validation rules
