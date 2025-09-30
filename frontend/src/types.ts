export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  owner_id: number;
  members: User[];
}

export interface Board {
  id: number;
  name: string;
  workspace_id: number;
}

export interface ListItem {
  id: number;
  name: string;
  position: number;
  board_id: number;
}

export interface Card {
  id: number;
  name: string;
  description?: string;
  position: number;
  list_id: number;
}

export interface Token {
  access_token: string;
  token_type: string;
}
