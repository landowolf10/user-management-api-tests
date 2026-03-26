import test, { expect, APIResponse } from '@playwright/test';
import { validateUserSchema, validateErrorSchema } from './schema.validator';

export class Assertions {
    static allowKnownBugs = false;

    static async expectStatus(
        res: APIResponse,
        expected: number,
        options?: { allowedStatuses?: number[]; message?: string }
    ) {
        const actual = res.status();

        if (actual === expected) {
            expect(actual).toBe(expected);
            return;
        }

        if (Assertions.allowKnownBugs && options?.allowedStatuses?.includes(actual)) {
            test.info().annotations.push({
                type: 'bug',
                description: options.message || `Expected ${expected}, got ${actual}`,
            });
            return;
        }

        expect(actual).toBe(expected);
    }

    static async expectJson(res: APIResponse) {
        const contentType = res.headers()['content-type'] || '';
        expect(contentType).toContain('application/json');
    }

    static async expectUser(res: APIResponse, expectedUser?: any) {
        await this.expectJson(res);

        const body = await res.json();

        if (Assertions.allowKnownBugs && res.status() >= 400) {
            test.info().annotations.push({
                type: 'bug',
                description: 'Skipping user schema validation due to known bug',
            });
            return;
        }

        validateUserSchema(body);

        if (expectedUser) {
            expect(body.name).toBe(expectedUser.name);
            expect(body.email).toBe(expectedUser.email);
            expect(body.age).toBe(expectedUser.age);
        }
    }

    static async expectUsersArray(res: APIResponse, expectedUser?: any) {
        await this.expectJson(res);

        const body = await res.json();

        expect(Array.isArray(body)).toBeTruthy();

        body.forEach(validateUserSchema);

        if (expectedUser) {
            const exists = body.some((u: any) => u.email === expectedUser.email);
            expect(exists).toBeTruthy();
        }
    }

    static async expectError(res: APIResponse, message?: string) {
        if (Assertions.allowKnownBugs && res.status() >= 200 && res.status() < 300) {
            return;
        }

        try {
            await this.expectJson(res);
            const body = await res.json();
            validateErrorSchema(body);

            if (message) {
                expect(body.error).toBe(message);
            }
        } catch (err) {
            if (Assertions.allowKnownBugs) return;
            throw err;
        }
    }

    static async expectUserPersisted(client: any, email: string, expectedUser: any, options?: { allowMismatch?: boolean, message?: string }) {
        const res = await client.getUser(email);
        await this.expectStatus(res, 200);

        const body = await res.json();

        if (options?.allowMismatch && Assertions.allowKnownBugs) {
            test.info().annotations.push({
                type: 'bug',
                description: options.message || `Expected user: ${JSON.stringify(expectedUser)}, got: ${JSON.stringify(body)}`,
            });
            return;
        }

        expect(body).toEqual(expectedUser);
    }
}