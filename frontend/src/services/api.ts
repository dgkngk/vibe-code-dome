import axios from 'axios';
import { Workspace, Board, ListItem, Card, User } from '../types';

const api = axios.create({
  baseURL: '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };

export const getWorkspaces = async (): Promise<Workspace[]> => {
  const response = await api.get('/api/workspaces/');
  return response.data;
};

export const createWorkspace = async (data: { name: string }): Promise<Workspace> => {
  const response = await api.post('/api/workspaces/', data);
  return response.data;
};

export const deleteWorkspace = async (workspaceId: number): Promise<void> => {
  await api.delete(`/api/workspaces/${workspaceId}/`);
};

export const getWorkspace = async (workspaceId: number): Promise<Workspace> => {
  const response = await api.get(`/api/workspaces/${workspaceId}/`);
  return response.data;
};

export const getBoards = async (workspaceId: number): Promise<Board[]> => {
  const response = await api.get(`/api/workspaces/${workspaceId}/boards/`);
  return response.data;
};

export const createBoard = async (workspaceId: number, data: { name: string }): Promise<Board> => {
  const response = await api.post(`/api/workspaces/${workspaceId}/boards/`, data);
  return response.data;
};

export const getLists = async (boardId: number): Promise<ListItem[]> => {
  const response = await api.get(`/api/boards/${boardId}/lists/`);
  return response.data;
};

export const createList = async (boardId: number, data: { name: string; position: number }): Promise<ListItem> => {
  const response = await api.post(`/api/boards/${boardId}/lists/`, data);
  return response.data;
};

export const deleteList = async (boardId: number, listId: number): Promise<void> => {
  await api.delete(`/api/boards/${boardId}/lists/${listId}/`);
};

export const getCards = async (listId: number): Promise<Card[]> => {
  const response = await api.get(`/api/lists/${listId}/cards/`);
  return response.data;
};

export const createCard = async (listId: number, data: { name: string; description?: string; position: number }): Promise<Card> => {
  const response = await api.post(`/api/lists/${listId}/cards/`, data);
  return response.data;
};

export const updateCard = async (listId: number, cardId: number, data: Partial<{ name: string; description?: string; position: number; list_id: number }>): Promise<Card> => {
  const response = await api.patch(`/api/lists/${listId}/cards/${cardId}`, data);
  return response.data;
};

export const deleteCard = async (listId: number, cardId: number): Promise<void> => {
  await api.delete(`/api/lists/${listId}/cards/${cardId}/`);
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await api.get('/api/users/search/', { params: { q: query } });
  return response.data;
};

export const addMember = async (workspaceId: number, userId: number): Promise<User> => {
  const response = await api.post(`/api/workspaces/${workspaceId}/members/`, null, { params: { user_id: userId } });
  return response.data;
};

export const getMembers = async (workspaceId: number): Promise<User[]> => {
  const response = await api.get(`/api/workspaces/${workspaceId}/members/`);
  return response.data;
};
