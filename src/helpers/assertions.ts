import { expect, APIResponse } from '@playwright/test';
import { validateUserSchema, validateErrorSchema } from './schema.validator';

export class Assertions {

  static async expectStatus(res: APIResponse, code: number) {
    expect(res.status()).toBe(code);
  }

  static async expectUser(res: APIResponse) {
    const body = await res.json();
    validateUserSchema(body);
  }

  static async expectUsersArray(res: APIResponse) {
    const body = await res.json();

    expect(Array.isArray(body)).toBeTruthy();

    body.forEach(validateUserSchema);
  }

  static async expectError(res: APIResponse, message?: string) {
    const body = await res.json();

    validateErrorSchema(body);

    if (message) {
      expect(body.error).toContain(message);
    }
  }
}