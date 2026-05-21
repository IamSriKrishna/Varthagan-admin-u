# Salary Calculation API - Quick Reference Guide

## Overview
The Salary Calculation API calculates employee salaries based on attendance records. It supports both monthly and weekly salary types.

## Service Methods

### Available Methods in `salaryService`

| Method | Signature | Description |
|--------|-----------|-------------|
| `calculateSalary()` | `calculateSalary(data: CalculateSalaryRequest): Promise<SalaryCalculationResponse>` | Calculate salary for employee |
| `getSalaryById()` | `getSalaryById(id: number \| string): Promise<SalaryCalculationResponse>` | Get salary details by ID |
| `getSalariesByEmployeeId()` | `getSalariesByEmployeeId(employeeId: number \| string): Promise<SalaryCalculationListResponse>` | Get all salaries for employee |
| `approveSalary()` | `approveSalary(salaryId: number \| string): Promise<SalaryApprovalResponse>` | Approve pending salary |
| `getSalarySummary()` | `getSalarySummary(fromDate: string, toDate: string): Promise<any>` | Get summary for date range |
| `getPendingSalaries()` | `getPendingSalaries(): Promise<SalaryCalculationListResponse>` | Get all pending salaries |
| `exportSalaries()` | `exportSalaries(month: number, year: number): Promise<any>` | Export salaries as CSV |

## Salary Calculation Formula

### Monthly Salary
```
Daily Rate = Base Salary / Days in Month
Earning Amount = (Present Days × Daily Rate) + (Half Days × Daily Rate / 2)
Deduction Amount = Absent Days × Daily Rate
Net Salary = Earning Amount - Deduction Amount
```

### Weekly Salary
```
Daily Rate = Weekly Salary / 7
Earning Amount = (Present Days × Daily Rate) + (Half Days × Daily Rate / 2)
Deduction Amount = Absent Days × Daily Rate
Net Salary = Earning Amount - Deduction Amount
```

## Attendance Status Mapping

| Status | Salary Impact |
|--------|---|
| `on_time` | Full Day Earning |
| `late` | Full Day Earning |
| `holiday` | Full Day Earning (Treated same as Present) |
| `leave` | Full Day Earning (Treated same as Present) |
| `half_day` | Half Day Earning |
| `absent` | Deduction |
| No Record | Deduction (Treated as Absent) |

## Week Definition

For weekly salary calculations:
- **Week 1:** Days 1-7 (e.g., May 1-7)
- **Week 2:** Days 8-14 (e.g., May 8-14)
- **Week 3:** Days 15-21 (e.g., May 15-21)
- **Week 4:** Days 22-28 (e.g., May 22-28)

*Note: Sundays are excluded from working days count*

## Example Usage in Components

### Calculate Salary
```typescript
import { salaryService } from '@/lib/api/salaryService';

async function handleCalculateSalary(employeeId: number, month: number, year: number) {
  try {
    const response = await salaryService.calculateSalary({
      employee_id: employeeId,
      month,
      year
    });
    
    if (response.success && response.data) {
      console.log('Salary Calculated:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Error calculating salary:', error);
  }
}
```

### Calculate Weekly Salary
```typescript
async function handleCalculateWeeklySalary(
  employeeId: number,
  month: number,
  year: number,
  week: number
) {
  try {
    const response = await salaryService.calculateSalary({
      employee_id: employeeId,
      month,
      year,
      week
    });
    
    if (response.success && response.data) {
      console.log('Weekly Salary Calculated:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Error calculating weekly salary:', error);
  }
}
```

### Get Employee Salary History
```typescript
async function handleGetEmployeeSalaryHistory(employeeId: number) {
  try {
    const response = await salaryService.getSalariesByEmployeeId(employeeId);
    
    if (response.success && response.data) {
      console.log('Salary History:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching salary history:', error);
  }
}
```

### Approve Salary
```typescript
async function handleApproveSalary(salaryId: number) {
  try {
    const response = await salaryService.approveSalary(salaryId);
    
    if (response.success) {
      console.log(response.message);
      return true;
    }
  } catch (error) {
    console.error('Error approving salary:', error);
  }
}
```

### Get Pending Salaries
```typescript
async function handleGetPendingSalaries() {
  try {
    const response = await salaryService.getPendingSalaries();
    
    if (response.success && response.data) {
      console.log('Pending Salaries:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching pending salaries:', error);
  }
}
```

## API Endpoints

### Main Endpoints (As per Documentation)
- `POST /auth/manage/salary/calculate` - Calculate salary
- `GET /auth/manage/salary/:id` - Get salary by ID
- `GET /auth/manage/salary/employee/:employee_id` - Get employee salaries
- `POST /auth/manage/salary/:id/approve` - Approve salary

### Additional Helper Endpoints
- `GET /auth/manage/salary/summary?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` - Get summary
- `GET /auth/manage/salary/status/pending` - Get pending salaries
- `GET /auth/manage/salary/export?month=1-12&year=YYYY` - Export to CSV

## Response Examples

### Salary Calculation Response
```typescript
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": 1,
    "employee_name": "John Doe",
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
    "notes": "Calculated based on monthly salary on 2026-05-21",
    "created_at": "2026-05-21T10:30:00Z",
    "updated_at": "2026-05-21T10:30:00Z"
  }
}
```

### Error Response
```typescript
{
  "error": true,
  "message": "employee not found"
}
```

## Important Notes

1. **Authentication Required:** All endpoints require admin authentication
2. **Company Isolation:** Calculations are isolated by company ID
3. **Sundays Excluded:** Sundays are automatically excluded from working days
4. **Holiday Treatment:** Holidays are treated as present days for earning
5. **No Record = Absent:** Days without attendance records count as absent with deduction

## Models Location

- **Service:** `src/lib/api/salaryService.ts`
- **Models:** `src/models/salary.model.ts`
- **API Documentation:** `docs/SALARY_CALCULATION_API.md`
- **Attendance Service:** `src/lib/api/attendanceService.ts`

## Testing Checklist

- [ ] Create employee with monthly salary ₹20,000
- [ ] Add attendance records for the month
- [ ] Calculate salary for employee
- [ ] Verify calculation logic is correct
- [ ] Retrieve salary details by ID
- [ ] Get all employee salaries
- [ ] Approve pending salary
- [ ] Get pending salaries list
- [ ] Test with weekly salary employee
- [ ] Test week-based calculation
- [ ] Export salary data to CSV

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `employee not found` | Invalid employee_id or wrong company | Verify employee exists and belongs to your company |
| `Invalid month` | Month not between 1-12 | Use valid month (1-12) |
| `Invalid year` | Year < 2000 | Use year >= 2000 |
| `Invalid week` | Week not between 1-4 (for weekly salary) | Use week 1-4, only for weekly salary employees |
| `salary calculation not found` | Invalid salary calculation ID | Verify salary ID exists |
| `401 Unauthorized` | Missing/invalid token | Ensure you have valid JWT token |
| `403 Forbidden` | Insufficient permissions | Ensure user has admin role |

## Related Documentation

- [Attendance API](./docs/ATTENDANCE_API.md)
- [Employee API](./docs/EMPLOYEE_API.md)
- [Full Salary Calculation API Documentation](./docs/SALARY_CALCULATION_API.md)

---

**Last Updated:** 2026-05-21
**Version:** 1.0.0
