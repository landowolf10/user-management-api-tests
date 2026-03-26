# Bugs Report — User Management API

## Overview

This report documents defects and inconsistencies identified while validating the API against the OpenAPI specification (`sdet_challenge_api.yml`).

All issues were discovered through automated E2E tests executed against both environments (`dev` and `prod`).

---

# Priority Summary

| Severity     | Issues                                                                        |
| ------------ | ----------------------------------------------------------------------------- |
| **Critical** | DELETE endpoint does not enforce authentication                               |
| **High**     | Incorrect status codes (500 instead of 404/409), GET after DELETE returns 500 |
| **Medium**   | PUT does not persist updates                                                  |
| **Low**      | Validation inconsistencies, authentication header inconsistency               |

---

# 1. Contract Violations

---

## 1.1 Duplicate user returns 500 instead of 409

* **Endpoint:** `POST /users`
* **Severity:** High

### Spec Reference

`sdet_challenge_api.yml` - `POST /users` - **409 Conflict**

### Steps to Reproduce

1. Send a valid `POST /dev/users` request
2. Repeat the same request with identical email

curl:
```bash
curl --location 'http://localhost:3000/dev/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Test",
    "email": "test@mail.com",
    "age": 1
  }'
```

### Expected

`409 Conflict`

### Actual

`500 Internal Server Error`

### Impact

Violates the API contract and forces clients to handle unexpected server errors instead of predictable business errors.

### Detected by

`users.dev.spec.ts` - *POST /users - 409 duplicate*

---

## 1.2 GET non-existing user returns 500 instead of 404

* **Endpoint:** `GET /users/{email}`
* **Severity:** High

### Spec Reference

`sdet_challenge_api.yml` - `GET /users/{email}` - **404 Not Found**

### Steps to Reproduce

1. Call `GET /dev/users/nonexistent@test.com`

curl:
```bash
curl --location 'http://localhost:3000/dev/users/test123@test.com'
```

### Expected

`404 Not Found`

### Actual

`500 Internal Server Error`

### Impact

Breaks expected REST behavior for missing resources and complicates client-side error handling.

### Detected by

`users.dev.spec.ts` - *GET /users/{email} - 404*

---

## 1.3 GET after DELETE returns 500 instead of 404

* **Endpoint:** `GET /users/{email}`
* **Severity:** High

### Scenario

User is deleted and then queried again

### Steps to Reproduce

1. Create user via `POST /dev/users`
2. Delete user via `DELETE /dev/users/{email}`
3. Call `GET /dev/users/{email}`

### Expected

`404 Not Found`

### Actual

`500 Internal Server Error`

### Impact

Breaks resource lifecycle consistency and REST expectations (deleted resource should not exist).

### Detected by

`users.dev.spec.ts` - *DELETE /users - verify deletion*

---

# 2. Functional Issues

---

## 2.1 PUT does not persist updates

* **Endpoint:** `PUT /users/{email}`
* **Severity:** Medium

### Spec Reference

`sdet_challenge_api.yml` - `PUT /users/{email}` - Updated resource

### Steps to Reproduce

1. Create user
2. Update user via `PUT /users/{email}`
3. Retrieve user via `GET /users/{email}`

curl:
1. 
```bash
curl --location 'http://localhost:3000/dev/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Test",
    "email": "test-data@mail.com",
    "age": 1
  }'
```

2. 
```bash
curl --location --request PUT 'http://localhost:3000/dev/users/test-data@mail.com' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Test",
    "email": "test-data@mail.com",
    "age": 15
  }'
```

3. 
```bash
curl --location 'http://localhost:3000/dev/users/test-data@mail.com'
```

### Expected

Updated values should be returned

### Actual

Response returns `200 OK`, but data remains unchanged

### Impact

Data integrity issue — API reports success without actually modifying data.

### Detected by

`users.dev.spec.ts` - *PUT /users - update user*

---

# 3. Validation Inconsistencies

---

## 3.1 Inconsistent input validation

* **Severity:** Low

### Spec Reference

Schema definitions in `sdet_challenge_api.yml`

### Observed Behavior

| Case                            | Expected | Actual        |
| ------------------------------- | -------- | ------------- |
| Empty string `""`               | Rejected | Rejected      |
| Whitespace `"   "`              | Rejected | Accepted      |
| Invalid email formats           | Rejected | Some accepted |
| Numeric values in string fields | Rejected | Accepted      |

### Impact

Leads to inconsistent data quality and unpredictable validation behavior.

### Detected by

Multiple negative test cases in `users.dev.spec.ts`

---

# 4. Security Issue

---

## 4.1 DELETE endpoint does not enforce authentication

* **Endpoint:** `DELETE /users/{email}`
* **Severity:** Critical

### Spec Reference

Endpoints requiring authorization token

### Steps to Reproduce

1. Create user
2. Call `DELETE /users/{email}` **without Authorization header**

curl:
1.
```bash
 curl --location 'http://localhost:3000/dev/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Test",
    "email": "test-data@mail.com",
    "age": 1
  }'
```

2. 
```bash
curl --location --request DELETE 'http://localhost:3000/dev/users/test-data@mail.com'
```

### Expected

`401 Unauthorized`

### Actual

`204 No Content` and user is deleted successfully

### Impact

Critical security vulnerability — allows unauthorized deletion of resources.

### Detected by

`users.dev.spec.ts` - *DELETE /users - 401 missing token*

---

## 4.2 DELETE endpoint accepts invalid token

* **Endpoint:** `DELETE /users/{email}`
* **Severity:** Critical

### Spec Reference

Endpoints requiring authorization token

### Steps to Reproduce

1. Create user
2. Call `DELETE /users/{email}` **with an invalid Authorization token**

curl:
1. 
```bash
curl --location 'http://localhost:3000/dev/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Test",
    "email": "test-data@mail.com",
    "age": 1
  }'
```

2. 
```bash
curl --location --request DELETE 'http://localhost:3000/dev/users/test-data@mail.com' \
--header 'Authentication: invalid-token'
```

### Expected

`401 Unauthorized`

### Actual

`204 No Content` — user is deleted despite invalid token

### Impact

Critical security vulnerability — allows deletion of resources with any token, not just valid ones.  

### Detected by

`users.dev.spec.ts` - *DELETE /users/{email} - 401 invalid token*

---

# 5. API Design Inconsistencies

---

## 5.1 Inconsistent authentication headers

* **Severity:** Low

# Conclusion

The API exhibits several issues that affect its **reliability, consistency, and security**:

* Contract violations (incorrect HTTP status codes)
* Functional defects (updates not persisted)
* Inconsistent validation rules
* Critical security vulnerability (unauthorized DELETE)
* API design inconsistencies

These issues reduce the predictability of the API and increase the complexity of client-side error handling and integration.
