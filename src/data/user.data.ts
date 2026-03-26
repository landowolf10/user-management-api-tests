import { PartialUser, User } from '../types/user.types';

export const generateUser = (overrides: PartialUser = {}): User => ({
    name: 'Test User',
    email: `user_${Date.now()}_${Math.floor(Math.random()*10000)}@test.com`,
    age: 10,
    ...overrides
});

export const invalidUser = {
    name: '',
    email: 'invalid-email',
    age: -1
};

export const invalidEmail = {
    name: 'Test User',
    email:  `user_${Date.now()}@`,
    age: 10
};

export const whiteSpaceUser = {
    name: ' ',
    email: `user_${Date.now()}@test.com`,
    age: 10
};

export const invalidTypes = {
    name: 1234,
    email: 5678,
    age: "thirty"
};

export const invalidNameNumber = {
    name: 10,
    email:  `user_${Date.now()}@test.com`,
    age: 10
};

export const invalidAge = {
    name: 'Test',
    email: 'test@test.com',
    age: 151
};

export const ErrorMessages = {
  invalidEmail: 'Invalid email format',
  ageRange: 'Age must be between 1 and 150',
  nameRequired: 'name is required'
};