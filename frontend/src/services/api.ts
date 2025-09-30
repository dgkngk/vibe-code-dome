import axios from 'axios';
import { Workspace, Board, ListItem, Card, User } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000',
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
  const response = await api.get('/workspaces/');
  return response.data;
};

export const createWorkspace = async (data: { name: string }): Promise<Workspace> => {
  const response = await api.post('/workspaces/', data);
  return response.data;
};

export const deleteWorkspace = async (workspaceId: number): Promise<void> => {
  await api.delete(`/workspaces/${workspaceId}/`);
};

export const getBoards = async (workspaceId: number): Promise<Board[]> => {
  const response = await api.get(`/workspaces/${workspaceId}/boards/`);
  return response.data;
};

export const createBoard = async (workspaceId: number, data: { name: string }): Promise<Board> => {
  const response = await api.post(`/workspaces/${workspaceId}/boards/`, data);
  return response.data;
};

export const getLists = async (boardId: number): Promise<ListItem[]> => {
  const response = await api.get(`/boards/${boardId}/lists/`);
  return response.data;
};

export const createList = async (boardId: number, data: { name: string; position: number }): Promise<ListItem> => {
  const response = await api.post(`/boards/${boardId}/lists/`, data);
  return response.data;
};

export const deleteList = async (boardId: number, listId: number): Promise<void> => {
  await api.delete(`/boards/${boardId}/lists/${listId}/`);
};

export const getCards = async (listId: number): Promise<Card[]> => {
  const response = await api.get(`/lists/${listId}/cards/`);
  return response.data;
};

export const createCard = async (listId: number, data: { name: string; description?: string; position: number }): Promise<Card> => {
  const response = await api.post(`/lists/${listId}/cards/`, data);
  return response.data;
};

export const updateCard = async (listId: number, cardId: number, data: Partial<{ name: string; description?: string; position: number; list_id: number }>): Promise<Card> => {
  const response = await api.patch(`/lists/${listId}/cards/${cardId}`, data);
  return response.data;
};

export const deleteCard = async (listId: number, cardId: number): Promise<void> => {
  await api.delete(`/lists/${listId}/cards/${cardId}/`);
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};
