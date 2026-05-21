# Salary Calculation API Documentation

## Overview
The Salary API handles employee salary calculations based on attendance records. It supports both **weekly** and **monthly** salary types, with holiday and present days treated equally for compensation purposes.

---

## API Endpoints

### 1. Calculate Salary
**Endpoint:** `POST /auth/manage/salary/calculate`

**Authentication:** Required (Admin)

**Description:** Calculates salary for an employee for a specific month/week based on their attendance records.

#### Request DTO

```json
{
  "employee_id": 1,
  "from_date": "2026-05-03",
  "to_date": "2026-05-09"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employee_id` | uint | Yes | ID of the employee |
| `from_date` | string | Yes | Start date for salary calculation (YYYY-MM-DD format) |
| `to_date` | string | Yes | End date for salary calculation (YYYY-MM-DD format) |

#### Request Body Schema

```typescript
interface CalculateSalaryRequest {
  employee_id: number;
  from_date: string; // YYYY-MM-DD format
  to_date: string; // YYYY-MM-DD format
}
```

#### Response DTO (Success - 201)

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
    "notes": "Calculated based on monthly salary on 2026-05-21",
    "created_at": "2026-05-21T10:30:00Z",
    "updated_at": "2026-05-21T10:30:00Z"
  }
}
```

#### Response Body Schema

```typescript
interface SalaryCalculationOutput {
  id: number;
  employee_id: number;
  employee_name: string;
  company_id: number;
  month: number;
  year: number;
  week?: number | null;
  base_salary: number;
  salary_type: 'monthly' | 'weekly';
  total_working_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  daily_rate: number;
  earning_amount: number;
  deduction_amount: number;
  net_salary: number;
  status: 'pending' | 'approved';
  notes: string;
  created_at: string;
  updated_at: string;
}
```

#### Response - Error (400)

```json
{
  "error": true,
  "message": "employee not found"
}
```

#### Salary Calculation Logic

##### For Monthly Salary Type:
- **Daily Rate** = Base Salary / Days in Month
- **Earning Amount** = (Present Days × Daily Rate) + (Half Days × Daily Rate / 2)
- **Deduction Amount** = Absent Days × Daily Rate
- **Net Salary** = Earning Amount - Deduction Amount

##### For Weekly Salary Type:
- **Daily Rate** = Weekly Salary / 7
- **Earning Amount** = (Present Days × Daily Rate) + (Half Days × Daily Rate / 2)
- **Deduction Amount** = Absent Days × Daily Rate
- **Net Salary** = Earning Amount - Deduction Amount

##### Attendance Status Mapping:
- **Present Days** (Earning Full Day): `on_time`, `late`, `holiday`, `leave`
- **Half Days** (Earning Half Day): `half_day`
- **Absent Days** (Deduction): `absent`, no record
- **Note:** Holiday and Present are treated the same for salary calculation

---

### 2. Get Salary Calculation
**Endpoint:** `GET /auth/manage/salary/:id`

**Authentication:** Required (Admin)

**Description:** Retrieves a specific salary calculation record.

#### Response DTO (Success - 200)

Same as Calculate Salary response

#### Response - Error (404)

```json
{
  "error": true,
  "message": "salary calculation not found"
}
```

---

### 3. Get Salary Calculations by Employee
**Endpoint:** `GET /auth/manage/salary/employee/:employee_id`

**Authentication:** Required (Admin)

**Description:** Retrieves all salary calculations for a specific employee.

#### Response DTO (Success - 200)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "employee_name": "Ravi Kumar",
      "month": 5,
      "year": 2026,
      "base_salary": 20000.00,
      "net_salary": 17727.27,
      "status": "pending",
      "created_at": "2026-05-21T10:30:00Z"
    },
    {
      "id": 2,
      "employee_id": 1,
      "employee_name": "Ravi Kumar",
      "month": 4,
      "year": 2026,
      "base_salary": 20000.00,
      "net_salary": 19000.00,
      "status": "approved",
      "created_at": "2026-04-21T10:30:00Z"
    }
  ]
}
```

#### Response Body Schema

```typescript
interface SalaryCalculationListOutput {
  id: number;
  employee_id: number;
  employee_name: string;
  month: number;
  year: number;
  base_salary: number;
  net_salary: number;
  status: 'pending' | 'approved';
  created_at: string;
}
```

---

### 4. Approve Salary
**Endpoint:** `POST /auth/manage/salary/:id/approve`

**Authentication:** Required (Admin)

**Description:** Approves a pending salary calculation.

#### Request DTO

```json
{}
```

#### Response - Success (200)

```json
{
  "success": true,
  "message": "Salary approved successfully"
}
```

#### Response - Error (400)

```json
{
  "error": true,
  "message": "salary calculation not found"
}
```

---

## Common Response Wrappers

### Success Response

```typescript
interface SuccessResponse {
  success: boolean;
  data?: any;
  message?: string;
  code?: number;
}
```

### Error Response

```typescript
interface ErrorResponse {
  error: boolean;
  message: string;
  code?: number;
}
```

---

## Attendance Status Reference

| Status | Code | Description | Salary Impact |
|--------|------|-------------|---|
| On Time | `on_time` | Employee arrived on time | Full Day Earning |
| Late | `late` | Employee arrived late | Full Day Earning |
| Holiday | `holiday` | Declared holiday | Full Day Earning (Treated same as Present) |
| Leave | `leave` | Approved leave | Full Day Earning (Treated same as Present) |
| Half Day | `half_day` | Employee worked half day | Half Day Earning |
| Absent | `absent` | Employee was absent | Deduction |
| No Record | - | No attendance record | Deduction (Treated as Absent) |

---

## Example Usage

### Calculate Monthly Salary

**Request:**
```bash
curl -X POST http://127.0.0.1:8088/auth/manage/salary/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "employee_id": 1,
    "from_date": "2026-05-01",
    "to_date": "2026-05-31"
  }'
```

**Response:**
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
    "notes": "Calculated based on monthly salary on 2026-05-21",
    "created_at": "2026-05-21T10:30:00Z",
    "updated_at": "2026-05-21T10:30:00Z"
  }
}
```

### Calculate Weekly Salary

**For May 2026 - Weekly salary is calculated as:**
- **Week 1 (May 1-7):** Request with `week: 1`
- **Week 2 (May 8-14):** Request with `week: 2`
- **Week 3 (May 15-21):** Request with `week: 3`
- **Week 4 (May 22-28):** Request with `week: 4`

**Request (Week 2 Example):**
```bash
curl -X POST http://127.0.0.1:8088/auth/manage/salary/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "employee_id": 2,
    "month": 5,
    "year": 2026,
    "week": 2
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "employee_id": 2,
    "employee_name": "John Doe",
    "company_id": 1,
    "month": 5,
    "year": 2026,
    "base_salary": 4500.00,
    "salary_type": "weekly",
    "total_working_days": 6,
    "present_days": 6,
    "absent_days": 0,
    "half_days": 0,
    "daily_rate": 642.86,
    "earning_amount": 3857.14,
    "deduction_amount": 0.00,
    "net_salary": 3857.14,
    "status": "pending",
    "notes": "Calculated based on weekly salary on 2026-05-21",
    "created_at": "2026-05-21T10:30:00Z",
    "updated_at": "2026-05-21T10:30:00Z"
  }
}
```

**Important:** 
- Mark attendance for all days in the week (May 8-14 for week 2)
- Sundays (May 12 in week 2) are automatically excluded from the calculation
- Days without attendance records are counted as absent with salary deduction

---

## Frontend Service Usage

### Using in React Components

```typescript
import { salaryService } from '@/lib/api/salaryService';

// Calculate salary
const handleCalculateSalary = async () => {
  try {
    const response = await salaryService.calculateSalary({
      employee_id: 1,
      month: 5,
      year: 2026
    });
    console.log('Salary calculated:', response.data);
  } catch (error) {
    console.error('Error calculating salary:', error);
  }
};

// Get salary by ID
const handleGetSalary = async (salaryId: number) => {
  try {
    const response = await salaryService.getSalaryById(salaryId);
    console.log('Salary details:', response.data);
  } catch (error) {
    console.error('Error fetching salary:', error);
  }
};

// Get all salaries for employee
const handleGetEmployeeSalaries = async (employeeId: number) => {
  try {
    const response = await salaryService.getSalariesByEmployeeId(employeeId);
    console.log('Employee salaries:', response.data);
  } catch (error) {
    console.error('Error fetching employee salaries:', error);
  }
};

// Approve salary
const handleApproveSalary = async (salaryId: number) => {
  try {
    const response = await salaryService.approveSalary(salaryId);
    console.log('Salary approved:', response.message);
  } catch (error) {
    console.error('Error approving salary:', error);
  }
};

// Get pending salaries
const handleGetPendingSalaries = async () => {
  try {
    const response = await salaryService.getPendingSalaries();
    console.log('Pending salaries:', response.data);
  } catch (error) {
    console.error('Error fetching pending salaries:', error);
  }
};

// Get salary summary
const handleGetSalarySummary = async () => {
  try {
    const response = await salaryService.getSalarySummary('2026-05-01', '2026-05-31');
    console.log('Salary summary:', response);
  } catch (error) {
    console.error('Error fetching salary summary:', error);
  }
};

// Export salaries
const handleExportSalaries = async () => {
  try {
    const response = await salaryService.exportSalaries(5, 2026);
    console.log('Salaries exported:', response);
  } catch (error) {
    console.error('Error exporting salaries:', error);
  }
};
```

---

## Error Codes

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 200 | OK | Successful retrieval |
| 201 | Created | Salary calculation created |
| 400 | Bad Request | Invalid request parameters, employee not found |
| 404 | Not Found | Salary calculation not found |
| 401 | Unauthorized | Missing/invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 500 | Internal Server Error | Server error |

---

## Implementation Notes

1. **Salary Type Determination:** The salary calculation automatically uses the employee's configured salary type (monthly or weekly).

2. **Holiday Handling:** Holidays are treated the same as present days for earning purposes (full day earnings).

3. **Week Definition (Fixed 7-day periods):**
   - **Week 1:** Day 1-7 of month (May 1-7)
   - **Week 2:** Day 8-14 of month (May 8-14)
   - **Week 3:** Day 15-21 of month (May 15-21)
   - **Week 4:** Day 22-28 of month (May 22-28)
   - **Note:** Sundays are excluded from working days count

4. **Period Calculation:** 
   - For monthly salary, the entire month is processed (excluding Sundays).
   - For weekly salary, the specified week period is processed (excluding Sundays).

5. **Authentication:** All salary endpoints require admin authentication via the authorization header.

6. **Company Isolation:** Salary calculations are isolated by company ID and unauthorized access attempts will return an error.

7. **Salary Calculation Endpoint Base URL:** 
   - Frontend proxy base: `/auth/manage/salary`
   - Backend endpoint: `http://127.0.0.1:8088/auth/manage/salary`

---

## Related Services

- **Attendance Service:** [attendanceService.ts](../src/lib/api/attendanceService.ts) - Manage employee attendance records
- **Employee Service:** [employeeService.ts](../src/lib/api/employeeService.ts) - Manage employee information and salary types

---

## Testing the API

### Prerequisites
1. Valid JWT token with Admin role
2. At least one employee with salary type configured (monthly or weekly)
3. Attendance records for the employee for the specified month/week

### Quick Test Steps

1. **Create an Employee** (if not exists)
   - Use Employee API to create employee with `salary_type: "monthly"` and `monthly_salary: 20000`

2. **Add Attendance Records**
   - Use Attendance API to mark attendance for May 2026
   - Example: May 1-21 (mark some as on_time, some as absent, some as half_day)

3. **Calculate Salary**
   - Call POST `/auth/manage/salary/calculate` with employee_id=1, month=5, year=2026
   - Verify the calculation is correct

4. **Retrieve Salary Details**
   - Call GET `/auth/manage/salary/1` (using the ID from step 3)
   - Verify all fields are populated correctly

5. **Approve Salary**
   - Call POST `/auth/manage/salary/1/approve`
   - Verify status changes to "approved"

6. **Get Employee Salaries**
   - Call GET `/auth/manage/salary/employee/1`
   - Verify all salary records for the employee are returned

---

## Troubleshooting

### "employee not found"
- Verify the employee_id is correct
- Ensure the employee is in the same company as the authenticated user
- Check employee exists in the database

### "No attendance records found"
- Verify attendance records are created for the specified month/year
- Check the date format is correct (YYYY-MM-DD)
- Ensure attendance records are created before calculating salary

### "Invalid month/year"
- Month must be between 1-12
- Year must be >= 2000

### "Invalid week"
- Week must be between 1-4
- Only applicable for weekly salary employees
- Week 1 = days 1-7, Week 2 = days 8-14, etc.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-21 | Initial API documentation |
| 1.1.0 | 2026-05-21 | Added weekly salary support |
| 1.2.0 | 2026-05-21 | Added additional helper endpoints |

---

**Last Updated:** 2026-05-21
**API Status:** Active
**Backend URL:** http://127.0.0.1:8088
