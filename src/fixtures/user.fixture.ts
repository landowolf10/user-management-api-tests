import { test as base } from '@playwright/test';
import { UserClient } from '../clients/user.client';
import { Assertions } from '../helpers/assertions';

Assertions.allowKnownBugs = true;

export const test = base.extend<{
  devClient: UserClient;
  prodClient: UserClient;
}>({
  devClient: async ({ request }, use) => {
    await use(new UserClient(request, 'dev'));
  },
  prodClient: async ({ request }, use) => {
    await use(new UserClient(request, 'prod'));
  }
});