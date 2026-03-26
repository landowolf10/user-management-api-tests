import { test } from '../fixtures/user.fixture';
import { Assertions } from '../helpers/assertions';
import { generateUser } from '../data/user.data';

test.describe('@prod Users API', () => {
  test('POST /users - 201', async ({ prodClient }) => {
    const user = generateUser();

    const res = await prodClient.createUser(user);

    await Assertions.expectStatus(res, 201);
    await Assertions.expectUser(res, user);
    await Assertions.expectUserPersisted(prodClient, user.email, user);
  });
});