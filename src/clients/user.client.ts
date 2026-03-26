import { APIRequestContext } from '@playwright/test';
import { ENV } from '../config/env';

export class UserClient {
  private basePath: string;

  constructor(
    private request: APIRequestContext,
    private environment: 'dev' | 'prod'
  ) {
    this.basePath = `/${this.environment}/users`;
  }

  private get authHeaders() {
    return {
      Authorization: `Bearer ${ENV.TOKEN}`,
      'Content-Type': 'application/json'
    };
  }

  getUsers() {
    return this.request.get(this.basePath);
  }

  createUser(user: unknown) {
    return this.request.post(this.basePath, {
      data: user,
      headers: this.authHeaders
    });
  }

  getUser(email: string) {
    return this.request.get(`${this.basePath}/${email}`);
  }

  updateUser(email: string, user: unknown) {
    return this.request.put(`${this.basePath}/${email}`, {
      data: user,
      headers: this.authHeaders
    });
  }

  deleteUser(email: string, token?: string) {
    return this.request.delete(`${this.basePath}/${email}`, {
      headers: {
            Authentication: token ?? ENV.TOKEN,
        }
    });
  }

  deleteUserWithoutToken(email: string) {
    return this.request.delete(`${this.basePath}/${email}`);
  }
}