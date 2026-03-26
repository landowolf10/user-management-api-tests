import { test } from '../fixtures/user.fixture';
import { Assertions } from '../helpers/assertions';
import {
    ErrorMessages, generateUser, invalidAge, invalidEmail, invalidNameNumber, invalidTypes, invalidUser, whiteSpaceUser
} from '../data/user.data';

test.describe('@dev Users API', () => {
    test('GET /users - 200', async ({ devClient }) => {
        const res = await devClient.getUsers();

        await Assertions.expectStatus(res, 200);
        await Assertions.expectUsersArray(res);
    });

    test('POST /users - 201 + validate content + persistence', async ({ devClient }) => {
        const user = generateUser();

        const res = await devClient.createUser(user);

        await Assertions.expectStatus(res, 201);
        await Assertions.expectUser(res, user);

        await Assertions.expectUserPersisted(devClient, user.email, user);
    });

    test('POST /users - 400 invalid data', async ({ devClient }) => {
        const res = await devClient.createUser(invalidUser);

        await Assertions.expectStatus(res, 400);
        await Assertions.expectError(res, ErrorMessages.nameRequired);
    });

    test('POST /users - 409 duplicate', async ({ devClient }) => {
        const user = generateUser();

        await devClient.createUser(user);
        const res = await devClient.createUser(user);

        await Assertions.expectStatus(res, 409, {
            allowedStatuses: [500],
            message: 'Known bug: POST duplicate user returns 500 instead of 409',
        });
    });

    test('GET /users/{email} - 200', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.getUser(user.email);

        await Assertions.expectStatus(res, 200);
        await Assertions.expectUser(res, user);
    });

    test('GET /users/{email} - 404', async ({ devClient }) => {
        const res = await devClient.getUser('notfound@test.com');

        await Assertions.expectStatus(res, 404, {
            allowedStatuses: [500],
            message: 'Known bug: GET non-existing user returns 500 instead of 404',
        });
        await Assertions.expectError(res);
    });

    test('PUT /users/{email} - 200 updates user', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const updated = { ...user, age: 40 };

        const updateRes = await devClient.updateUser(user.email, updated);
        await Assertions.expectStatus(updateRes, 200);

        await Assertions.expectUserPersisted(devClient, user.email, updated, {
            allowMismatch: true,
            message: 'Known bug: PUT does not update age correctly',
        });
    });

    test('PUT /users/{email} - 400 invalid data (white space)', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.updateUser(user.email, whiteSpaceUser);

        await Assertions.expectStatus(res, 400, {
            allowedStatuses: [200],
            message: 'Known bug: Inconsistent input validation / PUT method with space in name field returns 200 instead of 400',
        });
        await Assertions.expectError(res, ErrorMessages.invalidEmail);
    });

    test('PUT /users/{email} - 400 invalid data (number in name)', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.updateUser(user.email, invalidNameNumber);

        await Assertions.expectStatus(res, 400, {
            allowedStatuses: [200],
            message: 'Known bug: Inconsistent input validation / PUT method with number in name field returns 200 instead of 400',
        });
        await Assertions.expectError(res, ErrorMessages.invalidEmail);
    });

    test('PUT /users/{email} - 404 not found', async ({ devClient }) => {
        const user = generateUser();

        const res = await devClient.updateUser(user.email, user);

        await Assertions.expectStatus(res, 404);
        await Assertions.expectError(res);
    });

    test('POST /users - malformed email', async ({ devClient }) => {
        const res = await devClient.createUser(invalidEmail);

        await Assertions.expectStatus(res, 400, {
            allowedStatuses: [201],
            message: 'Known bug: Inconsistent input validation / POST method with invalid email returns 201 instead of 400',
        });
        await Assertions.expectError(res, ErrorMessages.invalidEmail);
    });

    test('POST /users - validate field types', async ({ devClient }) => {
        const res = await devClient.createUser(invalidTypes);

        await Assertions.expectStatus(res, 400);
        await Assertions.expectError(res);
    });

    test('POST /users - validate age boundaries', async ({ devClient }) => {
        const res = await devClient.createUser(invalidAge);

        await Assertions.expectStatus(res, 400);
        await Assertions.expectError(res, ErrorMessages.ageRange);
    });

    test('DELETE /users/{email} - 204 + verify deletion', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.deleteUser(user.email);

        await Assertions.expectStatus(res, 204);

        const getRes = await devClient.getUser(user.email);
        await Assertions.expectStatus(getRes, 404, {
            allowedStatuses: [500],
            message: 'Known bug: GET after DELETE returns 500 instead of 404',
        });
    });

    test('DELETE /users/{email} - 401 missing token', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        const res = await devClient.deleteUserWithoutToken(user.email);

        await Assertions.expectStatus(res, 401, {
            allowedStatuses: [204],
            message: 'Known bug: DELETE endpoint does not enforce authentication',
        });

        await Assertions.expectError(res);
    });

    test('DELETE /users/{email} - 404', async ({ devClient }) => {
        const res = await devClient.deleteUser('notfound@test.com');

        await Assertions.expectStatus(res, 404);
        await Assertions.expectError(res);
    });

    test('DELETE /users - idempotency (delete twice)', async ({ devClient }) => {
        const user = generateUser();
        await devClient.createUser(user);

        await devClient.deleteUser(user.email);
        const res = await devClient.deleteUser(user.email);

        await Assertions.expectStatus(res, 404);
    });
});