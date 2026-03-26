import test, { expect, APIResponse } from '@playwright/test';
import { validateUserSchema, validateErrorSchema } from './schema.validator';

export class Assertions {
    // Activar “modo Known Bugs” globalmente
    static allowKnownBugs = false;

    /**
     * Verifica el status code de la respuesta.
     * Si allowKnownBugs = true y el status está en allowedStatuses, se anota como bug y no falla.
     */
    static async expectStatus(
        res: APIResponse,
        expected: number,
        options?: { allowedStatuses?: number[]; message?: string }
    ) {
        const actual = res.status();

        // Status correcto
        if (actual === expected) {
            expect(actual).toBe(expected);
            return;
        }

        // Bug conocido
        if (Assertions.allowKnownBugs && options?.allowedStatuses?.includes(actual)) {
            test.info().annotations.push({
                type: 'bug',
                description: options.message || `Expected ${expected}, got ${actual}`,
            });
            return;
        }

        // Falla real
        expect(actual).toBe(expected);
    }

    /** Verifica que la respuesta tenga JSON */
    static async expectJson(res: APIResponse) {
        const contentType = res.headers()['content-type'] || '';
        expect(contentType).toContain('application/json');
    }

    /** Valida un usuario individual */
    static async expectUser(res: APIResponse, expectedUser?: any) {
        await this.expectJson(res);

        const body = await res.json();
        validateUserSchema(body);

        if (expectedUser) {
            expect(body.name).toBe(expectedUser.name);
            expect(body.email).toBe(expectedUser.email);
            expect(body.age).toBe(expectedUser.age);
        }
    }

    /** Valida un array de usuarios */
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

    /** Valida un error en la respuesta */
    static async expectError(res: APIResponse, message?: string) {
        // Si Known Bug causa status inesperado o body vacío, no falla
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
            if (Assertions.allowKnownBugs) return; // Ignora Known Bugs
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