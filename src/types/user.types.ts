export interface User {
  name: string;
  email: string;
  age: number;
}

export type PartialUser = Partial<User>;

export interface ErrorResponse {
  error: string;
}