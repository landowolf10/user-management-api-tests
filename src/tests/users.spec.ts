import { test } from '../fixtures/user.fixture';
import { Assertions } from '../helpers/assertions';
import {
    ErrorMessages,
    generateUser,
    invalidAge,
    invalidEmail,
    invalidNameNumber,
    invalidTypes,
    invalidUser,
    whiteSpaceUser
} from '../data/user.data';

test.describe('@Users API', () => {

    test('GET /users - 200', async ({ client }) => {
        const res = await client.getUsers();
        await Assertions.expectStatus(res, 200);
        await Assertions.expectUsersArray(res);
    });

    test('POST /users - 201 + validate content + persistence', async ({ client }) => {
        const user = generateUser();
        const res = await client.createUser(user);
        await Assertions.expectStatus(res, 201);
        await Assertions.expectUser(res, user);
        await Assertions.expectUserPersisted(client, user.email, user);
    });

    test('POST /users - 400 invalid data', async ({ client }) => {
        const res = await client.createUser(invalidUser);
        await Assertions.expectStatus(res, 400);
        await Assertions.expectError(res, ErrorMessages.nameRequired);
    });

    test('POST /users - age boundaries (1 and 150)', async ({ client }) => {
        const resMin = await client.createUser(generateUser({ age: 1 }));
        const resMax = await client.createUser(generateUser({ age: 150 }));
        await Assertions.expectStatus(resMin, 201);
        await Assertions.expectStatus(resMax, 201);
    });

    test('POST /users - age below 1 and above 150', async ({ client }) => {
        const resLow = await client.createUser(generateUser({ age: 0 }));
        const resHigh = await client.createUser(generateUser({ age: 151 }));
        await Assertions.expectStatus(resLow, 400);
        await Assertions.expectStatus(resHigh, 400);
    });

    test('POST /users - 409 duplicate', async ({ client, env }) => {
        const user = generateUser();
        await client.createUser(user);
        const res = await client.createUser(user);
        await Assertions.expectStatus(res, env === 'dev' ? 409 : 201, {
            allowedStatuses: [500],
            message: 'Known bug: POST duplicate user returns 500 instead of 409'
        });
    });

    test('GET /users/{email} - 200', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        const res = await client.getUser(user.email);
        await Assertions.expectStatus(res, 200);
        await Assertions.expectUser(res, user);
    });

    test('GET /users/{email} - 404', async ({ client }) => {
        const res = await client.getUser('notfound@test.com');
        await Assertions.expectStatus(res, 404, {
            allowedStatuses: [500],
            message: 'Known bug: GET non-existing user returns 500 instead of 404'
        });
        await Assertions.expectError(res);
    });

    test('PUT /users/{email} - 200 updates user', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        const updated = { ...user, age: 40 };
        const res = await client.updateUser(user.email, updated);
        await Assertions.expectStatus(res, 200);
        await Assertions.expectUserPersisted(client, user.email, updated, {
            allowMismatch: true,
            message: 'Known bug: PUT does not update age correctly',
        });
    });

    test('PUT /users/{email} - 400 invalid data (white space)', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        const res = await client.updateUser(user.email, whiteSpaceUser);
        await Assertions.expectStatus(res, 400, {
            allowedStatuses: [200],
            message: 'Known bug: PUT with space in name returns 200 instead of 400',
        });
    });

    test('PUT /users/{email} - 400 invalid data (number in name)', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        const res = await client.updateUser(user.email, invalidNameNumber);
        await Assertions.expectStatus(res, 400, {
            allowedStatuses: [200],
            message: 'Known bug: PUT with number in name returns 200 instead of 400',
        });
    });

    test('PUT /users/{email} - 404 not found', async ({ client }) => {
        const user = generateUser();
        const res = await client.updateUser(user.email, user);
        await Assertions.expectStatus(res, 404);
    });

    test('POST /users - malformed email', async ({ client }) => {
        const res = await client.createUser(invalidEmail);
        await Assertions.expectStatus(res, 400, {
            allowedStatuses: [201],
            message: 'Known bug: POST invalid email returns 201 instead of 400',
        });
    });

    test('POST /users - validate field types', async ({ client }) => {
        const res = await client.createUser(invalidTypes);
        await Assertions.expectStatus(res, 400);
    });

    test('POST /users - validate age boundaries', async ({ client }) => {
        const res = await client.createUser(invalidAge);
        await Assertions.expectStatus(res, 400);
    });

    test('DELETE /users/{email} - 204 + verify deletion', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        const res = await client.deleteUser(user.email);
        await Assertions.expectStatus(res, 204);
        const getRes = await client.getUser(user.email);
        await Assertions.expectStatus(getRes, 404, {
            allowedStatuses: [500],
            message: 'Known bug: GET after DELETE returns 500 instead of 404',
        });
    });

    test('DELETE /users/{email} - 401 invalid token', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        const res = await client.deleteUser(user.email, 'bad-token');
        await Assertions.expectStatus(res, 401, {
            allowedStatuses: [204],
            message: 'Known bug: DELETE accepts invalid token',
        });
    });

    test('DELETE /users/{email} - 401 missing token', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        const res = await client.deleteUserWithoutToken(user.email);
        await Assertions.expectStatus(res, 401, {
            allowedStatuses: [204],
            message: 'Known bug: DELETE missing token passes',
        });
    });

    test('DELETE /users/{email} - 404', async ({ client }) => {
        const res = await client.deleteUser('notfound@test.com');
        await Assertions.expectStatus(res, 404);
    });

    test('DELETE /users - idempotency (delete twice)', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        await client.deleteUser(user.email);
        const res = await client.deleteUser(user.email);
        await Assertions.expectStatus(res, 404);
    });

    test('POST /users - To large email', async ({ client }) => {
        const user = generateUser({ email: 'a'.repeat(244) + '@example.com' });
        const res = await client.createUser(user);
        await Assertions.expectStatus(res, 201, {
            allowedStatuses: [500],
        });
    });

    test('POST /users - Null fields', async ({ client }) => {
        const res = await client.createUser({ name: null, email: null, age: null });
        await Assertions.expectStatus(res, 400);
    });

    test('POST /users - Unexpected additional fields', async ({ client }) => {
        const user = { ...generateUser(), extraField: 'unexpected' };
        const res = await client.createUser(user);
        await Assertions.expectStatus(res, 201);
    });

    test('PUT /users/{email} - Null fields', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        const res = await client.updateUser(user.email, { name: null, email: null, age: null });
        await Assertions.expectStatus(res, 400);
    });

    test('PUT /users/{email} - Unexpected additional fields', async ({ client }) => {
        const user = generateUser();
        await client.createUser(user);
        const res = await client.updateUser(user.email, { ...user, extraField: 'oops' });
        await Assertions.expectStatus(res, 200);
    });

});