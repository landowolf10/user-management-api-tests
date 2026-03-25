import { expect } from '@playwright/test';
import { test } from '../fixtures/user.fixture';
import { Assertions } from '../helpers/assertions';
import { ErrorMessages, generateUser, invalidAge, invalidEmail, invalidNameNumber, invalidTypes, invalidUser, whiteSpaceUser } from '../data/user.data';

test.describe('@dev Users API', () => {
    test('GET /users → 200', async ({ devClient }) => {
        const res = await devClient.getUsers();

        await Assertions.expectStatus(res, 200);
        await Assertions.expectUsersArray(res);
    });

    test('POST /users → 201', async ({ devClient }) => {
        const user = generateUser();

        const res = await devClient.createUser(user);

        await Assertions.expectStatus(res, 201);
        await Assertions.expectUser(res);
    });

    test('POST /users → 400 invalid data', async ({ devClient }) => {
        const res = await devClient.createUser(invalidUser);

        await Assertions.expectStatus(res, 400);
        await Assertions.expectError(res);
    });

    test('POST /users → 409 duplicate', async ({ devClient }) => {
        const user = generateUser();

        await devClient.createUser(user);
        const res = await devClient.createUser(user);

        await Assertions.expectStatus(res, 409);
    });

    test('GET /users/{email} → 200', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.getUser(user.email);

        await Assertions.expectStatus(res, 200);
        await Assertions.expectUser(res);
    });

    test('GET /users/{email} → 404', async ({ devClient }) => {
        const res = await devClient.getUser('notfound@test.com');

        await Assertions.expectStatus(res, 404);
    });

    test('PUT /users/{email} → 200 updates user', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const updated = { ...user, age: 40 };

        await devClient.updateUser(user.email, updated);
        const res = await devClient.getUser(user.email);

        const body = await res.json();

        expect(body.age).toBe(40);
    });

    test('PUT /users/{email} → 400 invalid data (white space in name field)', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.updateUser(user.email, whiteSpaceUser);

        await Assertions.expectStatus(res, 400);
        await Assertions.expectError(res, ErrorMessages.invalidEmail);
    });

    test('PUT /users/{email} → 400 invalid data (number in name field)', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.updateUser(user.email, invalidNameNumber);

        await Assertions.expectStatus(res, 400);
        await Assertions.expectError(res, ErrorMessages.invalidEmail);
    });

    test('PUT /users/{email} → 404 not found', async ({ devClient }) => {
        const user = generateUser();

        const res = await devClient.updateUser(user.email, user);

        await Assertions.expectStatus(res, 404);
    });

    test('POST /users → malformed email', async ({ devClient }) => {
        const res = await devClient.createUser(invalidEmail);

        await Assertions.expectStatus(res, 400);
        await Assertions.expectError(res, ErrorMessages.invalidEmail);
    });

    test('POST /users → validate field types', async ({ devClient }) => {
        const res = await devClient.createUser(invalidTypes);

        await Assertions.expectStatus(res, 400);
    });

    test('POST /users → validate age boundaries', async ({ devClient }) => {
        const res = await devClient.createUser(invalidAge);

        await Assertions.expectStatus(res, 400);
        await Assertions.expectError(res, ErrorMessages.ageRange);
    });

    test('DELETE /users/{email} → 204', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.deleteUser(user.email);

        await Assertions.expectStatus(res, 204);
    });

    test('DELETE /users/{email} → 401 missing token', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.deleteUserWithoutToken(user.email);

        await Assertions.expectStatus(res, 401);
    });

    test('DELETE /users/{email} → 404', async ({ devClient }) => {
        const res = await devClient.deleteUser('notfound@test.com');

        await Assertions.expectStatus(res, 404);
    });
});