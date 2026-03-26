import { expect, APIResponse } from '@playwright/test';
import { validateUserSchema, validateErrorSchema } from './schema.validator';

export class Assertions {

  static async expectStatus(res: APIResponse, code: number) {
    expect.soft(res.status()).toBe(code);
  }

  static async expectJson(res: APIResponse) {
    const contentType = res.headers()['content-type'];
    expect(contentType).toContain('application/json');
  }

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
    await this.expectJson(res);

    const body = await res.json();

    validateErrorSchema(body);

    if (message) {
      expect(body.error).toBe(message);
    }
  }

  static async expectUserPersisted(client: any, email: string, expectedUser: any) {
    const res = await client.getUser(email);

    await this.expectStatus(res, 200);

    const body = await res.json();

    expect(body).toEqual(expectedUser);
  }
}