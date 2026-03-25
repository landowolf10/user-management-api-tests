# 🐞 Bugs Report - User Management API

## Overview
This report documents inconsistencies and defects identified while validating the API against the OpenAPI 3.0 specification.

The issues are grouped by severity and type: contract violations, functional issues, validation inconsistencies, and security risks.

---

# 1. Contract Violations

## 1.1 Duplicate user returns 500 instead of 409
- **Endpoint:** POST /users
- **Expected:** 409 Conflict
- **Actual:** 500 Internal Server Error
- **Impact:** Breaks API contract and prevents proper client error handling

---

## 1.2 GET non-existing user returns 500 instead of 404
- **Endpoint:** GET /users/{email}
- **Expected:** 404 Not Found
- **Actual:** 500 Internal Server Error
- **Impact:** Incorrect error handling for missing resources

---

# 2. Functional Issues

## 2.1 PUT does not persist updates
- **Endpoint:** PUT /users/{email}
- **Expected:** Updated user data should be persisted
- **Actual:** Returns 200 OK but data remains unchanged when validated via GET
- **Impact:** Data integrity issue

---

# 3. Validation Inconsistencies

## 3.1 Inconsistent input validation behavior

### Issue
Validation is partially enforced and inconsistent across different inputs.

### Examples
- Empty string (`""`) for `name` is rejected, but whitespace (`"   "`) is accepted
- Some invalid email formats are accepted
- Numeric values are accepted in fields expected to be strings (e.g., `name`, `email`)

### Expected
Validation should strictly follow OpenAPI schema:
- `name`: non-empty string
- `email`: valid email format
- `age`: integer between 1 and 150

### Actual
Validation rules are inconsistently applied

### Impact
Unpredictable API behavior and potential data quality issues

---

# 4. Security Issue

## 4.1 DELETE endpoint does not enforce authentication
- **Endpoint:** DELETE /users/{email}
- **Expected:** 401 Unauthorized when token is missing
- **Actual:** 204 No Content and user is deleted without authentication
- **Impact:** Critical security vulnerability (unauthorized data deletion)

---

# 5. API Design Inconsistency

## 5.1 Inconsistent authentication headers
- POST/PUT use: `Authorization: Bearer <token>`
- DELETE uses: `Authentication: <token>`

### Impact
- Confusing API design
- Increases client implementation complexity

---

# Conclusion

The API presents several critical issues:

- Contract violations (incorrect status codes)
- Functional defects (data not persisted)
- Inconsistent validation logic
- Critical security vulnerability in DELETE endpoint
- API design inconsistencies

These issues affect reliability, predictability, and security of the system.