export interface User {
  id: number;
  email: string;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  owner_id: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
