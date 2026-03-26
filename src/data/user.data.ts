import { User } from '../types/user.types';

export const generateUser = (): User => ({
    name: 'Test User',
    email: `user_${Date.now()}@test.com`,
    age: 10
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
    email: 'invalid-email',
    age: -1
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