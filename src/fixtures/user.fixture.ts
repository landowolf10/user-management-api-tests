import { test as base } from '@playwright/test';
import { UserClient } from '../clients/user.client';
import { Assertions } from '../helpers/assertions';

Assertions.allowKnownBugs = true;

type Env = 'dev' | 'prod';

export const test = base.extend<{
  client: UserClient;
}>({
  client: async ({ request }, use) => {
    const env = (process.env.ENV || 'dev') as Env;
    const client = new UserClient(request, env);
    await use(client);
  }
});