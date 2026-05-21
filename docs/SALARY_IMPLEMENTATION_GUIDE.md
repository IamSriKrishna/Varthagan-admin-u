# Salary Calculation API - Implementation Complete

## Summary
The Salary Calculation API has been fully implemented based on the provided API documentation. This guide covers all changes made and how to use the new features.

---

## What Was Implemented

### 1. **API Service Layer** ✅
**File:** `src/lib/api/salaryService.ts`

#### Base URL Updated
- Changed from: `/admin/salary`
- Changed to: `/auth/manage/salary`

#### Implemented Methods
- `calculateSalary()` - Calculate salary for employee (monthly or weekly)
- `getSalaryById()` - Get salary details by ID
- `getSalariesByEmployeeId()` - Get all salaries for an employee
- `approveSalary()` - Approve pending salary
- `getSalarySummary()` - Get summary for date range
- `getPendingSalaries()` - Get all pending salaries
- `exportSalaries()` - Export salaries to CSV

#### Calculation Formula Implemented
**Monthly Salary:**
```
Daily Rate = Base Salary / Days in Month
Earning = (Present Days × Daily Rate) + (Half Days × Daily Rate / 2)
Deduction = Absent Days × Daily Rate
Net Salary = Earning - Deduction
```

**Weekly Salary:**
```
Daily Rate = Weekly Salary / 7
Earning = (Present Days × Daily Rate) + (Half Days × Daily Rate / 2)
Deduction = Absent Days × Daily Rate
Net Salary = Earning - Deduction
```

### 2. **Data Models** ✅
**File:** `src/models/salary.model.ts`

#### Request Models
- `CalculateSalaryRequest` - Input for salary calculation
- `ApproveSalaryRequest` - Input for salary approval

#### Response Models
- `SalaryCalculationOutput` - Full salary calculation details
- `SalaryCalculationListOutput` - Summary salary record
- `SalaryCalculationResponse` - API response wrapper
- `SalaryCalculationListResponse` - List API response wrapper
- `SalaryApprovalResponse` - Approval response wrapper
- `AttendanceStatus` - Type for attendance statuses

### 3. **React Hook** ✅
**File:** `src/hooks/useSalaryCalculation.ts`

A custom hook for managing salary calculations in React components with:
- State management (salary, salaries, loading, error)
- All salary service methods
- Error handling
- Automatic state updates

### 4. **Example Component** ✅
**File:** `src/components/salary/SalaryCalculationExample.tsx`

A complete example component demonstrating:
- Monthly salary calculation
- Weekly salary calculation
- Viewing salary history
- Viewing pending salaries
- Approving salaries
- Filter management
- Error handling
- Loading states

### 5. **Documentation** ✅

#### Complete API Documentation
**File:** `docs/SALARY_CALCULATION_API.md`
- All endpoint details
- Request/response examples
- Salary calculation logic
- Attendance status mapping
- Frontend service usage examples
- Troubleshooting guide
- Version history

#### Quick Reference Guide
**File:** `docs/SALARY_API_QUICK_REFERENCE.md`
- Method signatures
- Code examples
- Formula breakdown
- Common errors and solutions
- Related documentation links

---

## API Endpoints

### Main Endpoints

#### 1. Calculate Salary
```
POST /auth/manage/salary/calculate
```

**Request:**
```json
{
  "employee_id": 1,
  "month": 5,
  "year": 2026,
  "week": null
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": 1,
    "employee_name": "Ravi Kumar",
    "company_id": 1,
    "month": 5,
    "year": 2026,
    "base_salary": 20000.00,
    "salary_type": "monthly",
    "total_working_days": 22,
    "present_days": 20,
    "absent_days": 1,
    "half_days": 1,
    "daily_rate": 909.09,
    "earning_amount": 18636.36,
    "deduction_amount": 909.09,
    "net_salary": 17727.27,
    "status": "pending",
    "notes": "Calculated based on monthly salary",
    "created_at": "2026-05-21T10:30:00Z",
    "updated_at": "2026-05-21T10:30:00Z"
  }
}
```

#### 2. Get Salary by ID
```
GET /auth/manage/salary/:id
```

#### 3. Get Employee Salaries
```
GET /auth/manage/salary/employee/:employee_id
```

#### 4. Approve Salary
```
POST /auth/manage/salary/:id/approve
```

#### 5. Get Pending Salaries (Helper)
```
GET /auth/manage/salary/status/pending
```

#### 6. Get Salary Summary (Helper)
```
GET /auth/manage/salary/summary?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
```

#### 7. Export Salaries (Helper)
```
GET /auth/manage/salary/export?month=1-12&year=YYYY
```

---

## How to Use

### Using the Service Directly

```typescript
import { salaryService } from '@/lib/api/salaryService';

// Calculate monthly salary
const response = await salaryService.calculateSalary({
  employee_id: 1,
  month: 5,
  year: 2026
});

// Get salary by ID
const salary = await salaryService.getSalaryById(1);

// Get employee salary history
const history = await salaryService.getSalariesByEmployeeId(1);

// Approve salary
const result = await salaryService.approveSalary(1);
```

### Using the Custom Hook

```typescript
import { useSalaryCalculation } from '@/hooks/useSalaryCalculation';

export function MyComponent() {
  const {
    salary,
    salaries,
    loading,
    error,
    calculateSalary,
    getSalariesByEmployee,
    approveSalary,
    getPendingSalaries,
    clearError
  } = useSalaryCalculation();

  const handleCalculate = async () => {
    await calculateSalary({
      employee_id: 1,
      month: 5,
      year: 2026
    });
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {salary && <p>Net Salary: ₹{salary.net_salary}</p>}
      <button onClick={handleCalculate}>Calculate</button>
    </div>
  );
}
```

### Using the Example Component

```typescript
import { SalaryCalculationExample } from '@/components/salary/SalaryCalculationExample';

export function App() {
  return <SalaryCalculationExample />;
}
```

---

## Attendance Status Mapping

The salary calculation uses attendance records with the following status mapping:

| Status | Type | Salary Impact |
|--------|------|---|
| `on_time` | Present | Full Day Earning |
| `late` | Present | Full Day Earning |
| `holiday` | Present | Full Day Earning |
| `leave` | Present | Full Day Earning |
| `half_day` | Half | Half Day Earning |
| `absent` | Absent | Deduction |
| No Record | Absent | Deduction |

---

## Week Definition

For weekly salary calculations, weeks are defined as:
- **Week 1:** Days 1-7 (e.g., May 1-7)
- **Week 2:** Days 8-14 (e.g., May 8-14)
- **Week 3:** Days 15-21 (e.g., May 15-21)
- **Week 4:** Days 22-28 (e.g., May 22-28)

**Important:** Sundays are automatically excluded from the working days count.

---

## File Structure

```
src/
├── lib/api/
│   └── salaryService.ts (UPDATED)
│
├── models/
│   └── salary.model.ts (VERIFIED)
│
├── hooks/
│   └── useSalaryCalculation.ts (CREATED)
│
└── components/
    └── salary/
        └── SalaryCalculationExample.tsx (CREATED)

docs/
├── SALARY_CALCULATION_API.md (CREATED)
└── SALARY_API_QUICK_REFERENCE.md (CREATED)
```

---

## Key Features

✅ **Monthly & Weekly Salary Support** - Supports both salary types automatically

✅ **Attendance-Based Calculation** - Automatically calculates based on attendance records

✅ **Smart Holiday Handling** - Holidays treated as present days (no deduction)

✅ **Detailed Breakdown** - Provides earning, deduction, and net salary details

✅ **Status Management** - Track pending and approved salaries

✅ **Error Handling** - Comprehensive error messages and handling

✅ **TypeScript Support** - Full type safety with interfaces

✅ **React Integration** - Custom hook for easy component integration

✅ **Comprehensive Documentation** - Complete API docs and examples

---

## Testing Checklist

- [ ] **Setup Test Data**
  - [ ] Create employee with monthly salary (₹20,000)
  - [ ] Create employee with weekly salary (₹4,500)
  - [ ] Add attendance records for the month

- [ ] **Test Monthly Calculation**
  - [ ] Calculate salary for May 2026
  - [ ] Verify daily rate calculation
  - [ ] Verify earning and deduction amounts
  - [ ] Verify net salary calculation

- [ ] **Test Weekly Calculation**
  - [ ] Calculate salary for Week 1
  - [ ] Calculate salary for Week 2-4
  - [ ] Verify working days exclusion (Sundays)

- [ ] **Test CRUD Operations**
  - [ ] Get salary by ID
  - [ ] Get employee salary history
  - [ ] View pending salaries
  - [ ] Approve pending salary

- [ ] **Test Error Handling**
  - [ ] Invalid employee ID
  - [ ] Invalid month/year
  - [ ] Missing attendance records
  - [ ] Unauthorized access

---

## Integration Steps

### Step 1: Use the Service
In any React component or page:
```typescript
import { salaryService } from '@/lib/api/salaryService';

async function calculateEmployeeSalary(employeeId: number) {
  const response = await salaryService.calculateSalary({
    employee_id: employeeId,
    month: 5,
    year: 2026
  });
  return response.data;
}
```

### Step 2: Use the Hook
In React components:
```typescript
import useSalaryCalculation from '@/hooks/useSalaryCalculation';

export function SalaryComponent() {
  const { salary, loading, error, calculateSalary } = useSalaryCalculation();
  
  // Use in your component
}
```

### Step 3: Add to UI
Create a salary section in your admin dashboard:
```typescript
import { SalaryCalculationExample } from '@/components/salary/SalaryCalculationExample';

export function Dashboard() {
  return (
    <div>
      <SalaryCalculationExample />
    </div>
  );
}
```

---

## Common Use Cases

### 1. Calculate and Display Salary
```typescript
const { salary, calculateSalary, loading } = useSalaryCalculation();

const handleCalculate = async () => {
  await calculateSalary({ employee_id: 1, month: 5, year: 2026 });
};

if (salary) {
  return <div>Net Salary: ₹{salary.net_salary}</div>;
}
```

### 2. Show Salary History
```typescript
const { salaries, getSalariesByEmployee } = useSalaryCalculation();

const loadHistory = async () => {
  await getSalariesByEmployee(1);
};

return salaries.map(s => (
  <div key={s.id}>
    {s.employee_name} - {s.month}/{s.year}: ₹{s.net_salary}
  </div>
));
```

### 3. Approve Pending Salaries
```typescript
const { getPendingSalaries, approveSalary } = useSalaryCalculation();

const pendingList = await getPendingSalaries();
pendingList.forEach(async (salary) => {
  if (salary.status === 'pending') {
    await approveSalary(salary.id);
  }
});
```

---

## Error Handling

All methods handle errors gracefully:

```typescript
const { error, clearError, calculateSalary } = useSalaryCalculation();

try {
  await calculateSalary({ employee_id: 1, month: 5, year: 2026 });
} catch (err) {
  console.error(error);
  // Handle error UI
}
```

Common error messages:
- `"employee not found"` - Invalid employee ID
- `"Invalid month"` - Month not between 1-12
- `"Invalid year"` - Year < 2000
- `"Invalid week"` - Week not between 1-4
- `"salary calculation not found"` - Invalid salary ID

---

## Performance Considerations

- ✅ Service methods are cached at component level
- ✅ Use React.memo for salary display components
- ✅ Implement pagination for large employee lists
- ✅ Consider using React Query for caching

---

## Security Notes

- 🔒 All endpoints require admin authentication
- 🔒 Salary data is isolated by company ID
- 🔒 Bearer token automatically injected from localStorage
- 🔒 CORS headers properly configured

---

## Related Services

- **Attendance Service:** `src/lib/api/attendanceService.ts`
- **Employee Service:** `src/lib/api/employeeService.ts`
- **API Service:** `src/lib/api/api.service.ts` (Base HTTP client)

---

## FAQ

### Q: How do holidays and leaves affect salary?
A: Holidays and leaves are treated as present days, so they earn the full daily rate with no deduction.

### Q: What happens if there's no attendance record?
A: Days without attendance records are treated as absent and incur a deduction.

### Q: Can I calculate salary for past months?
A: Yes, you can calculate for any month/year as long as attendance records exist.

### Q: Is the calculation automatic?
A: Yes, it automatically calculates based on the employee's salary type and attendance records.

### Q: How do I export salary data?
A: Use the `exportSalaries()` method with month and year parameters.

---

## Troubleshooting

### Issue: "employee not found"
- Verify employee ID is correct
- Check employee belongs to your company
- Ensure employee is in the database

### Issue: "No attendance records"
- Check attendance records are created
- Verify date range matches calculation period
- Ensure attendance records are for correct employee

### Issue: Wrong salary amount
- Check employee's base salary is configured
- Verify attendance records are correct
- Check salary type matches calculation

---

## Next Steps

1. **Integrate into Admin Dashboard** - Add salary calculation UI
2. **Create Salary Reports** - Build reporting features
3. **Add Batch Processing** - Calculate multiple employee salaries
4. **Implement Notifications** - Notify on approval/rejection
5. **Add Payroll Export** - Export for payment processing

---

## Support & Documentation

- 📖 Full API Docs: `docs/SALARY_CALCULATION_API.md`
- 🔍 Quick Reference: `docs/SALARY_API_QUICK_REFERENCE.md`
- 💡 Example Component: `src/components/salary/SalaryCalculationExample.tsx`
- 🎣 Custom Hook: `src/hooks/useSalaryCalculation.ts`

---

**Implementation Date:** 2026-05-21  
**Status:** ✅ Complete  
**Version:** 1.0.0
