export interface CreateAccoutOptions {
    fullname:string,
    email:string
    username:string
    country:string
    password:string
}

export interface LoginOptions {
  username: string;
  password: string;
}

export interface CheckUserOptions {
  username?: string;
  email?: string;
}

export interface ActivateAccountOptions {
  email: string;
  token: string;
}