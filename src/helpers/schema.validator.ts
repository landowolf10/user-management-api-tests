import Ajv from 'ajv';

const ajv = new Ajv();

export const userSchema = {
  type: 'object',
  required: ['name', 'email', 'age'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'integer', minimum: 1, maximum: 150 }
  }
};

export const errorSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: { type: 'string' }
  }
};

const validateUser = ajv.compile(userSchema);
const validateError = ajv.compile(errorSchema);

export const validateUserSchema = (data: any) => {
  if (!validateUser(data)) {
    throw new Error(JSON.stringify(validateUser.errors, null, 2));
  }
};

export const validateErrorSchema = (data: any) => {
  if (!validateError(data)) {
    throw new Error(JSON.stringify(validateError.errors, null, 2));
  }
};