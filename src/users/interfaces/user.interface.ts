export interface User {
  readonly id: number;
  readonly email: string;
  readonly password: string;
}

export interface IUserRegisterResponse {
  readonly email: string;
  readonly username: string;
}
