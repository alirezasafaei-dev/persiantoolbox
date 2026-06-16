/**
 * User Accounts Manager - PersianToolbox
 *
 * Manages user accounts and authentication
 */

import {agentLogger} from '@/lib/agent-logger';

export type UserRole = 'user' | 'premium' | 'admin';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: 'fa' | 'en';
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  favoriteTools: string[];
}

export interface AuthToken {
  userId: string;
  token: string;
  expiresAt: string;
}

const users = new Map<string, UserAccount>();
const authTokens = new Map<string, AuthToken>();
const passwordHashes = new Map<string, string>();

export function createUser(
  email: string,
  password: string,
  name: string,
): UserAccount {
  if (Array.from(users.values()).some((u) => u.email === email)) {
    throw new Error('Email already exists');
  }

  const user: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    email,
    name,
    role: 'user',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    preferences: {
      language: 'fa',
      theme: 'system',
      notifications: true,
      favoriteTools: [],
    },
  };

  users.set(user.id, user);
  passwordHashes.set(user.id, hashPassword(password));

  agentLogger.info('accounts', 'create', `User created: ${user.id}`, {email});
  return user;
}

export function authenticateUser(email: string, password: string): AuthToken | null {
  const user = Array.from(users.values()).find((u) => u.email === email);
  if (!user) {
    return null;
  }

  const storedHash = passwordHashes.get(user.id);
  if (!storedHash || !verifyPassword(password, storedHash)) {
    return null;
  }

  user.lastLoginAt = new Date().toISOString();
  users.set(user.id, user);

  const token: AuthToken = {
    userId: user.id,
    token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  authTokens.set(token.token, token);
  agentLogger.info('accounts', 'authenticate', `User authenticated: ${user.id}`);
  return token;
}

export function validateToken(token: string): UserAccount | null {
  const authToken = authTokens.get(token);
  if (!authToken || new Date(authToken.expiresAt) < new Date()) {
    return null;
  }
  return users.get(authToken.userId) ?? null;
}

export function getUserById(userId: string): UserAccount | undefined {
  return users.get(userId);
}

export function updateUser(
  userId: string,
  updates: Partial<UserAccount>,
): UserAccount | null {
  const user = users.get(userId);
  if (!user) {
    return null;
  }

  const updatedUser = {...user, ...updates, id: user.id};
  users.set(userId, updatedUser);

  agentLogger.info('accounts', 'update', `User updated: ${userId}`);
  return updatedUser;
}

export function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>,
): boolean {
  const user = users.get(userId);
  if (!user) {
    return false;
  }

  user.preferences = {...user.preferences, ...preferences};
  users.set(userId, user);
  return true;
}

export function addToFavorites(userId: string, toolId: string): boolean {
  const user = users.get(userId);
  if (!user) {
    return false;
  }

  if (!user.preferences.favoriteTools.includes(toolId)) {
    user.preferences.favoriteTools.push(toolId);
    users.set(userId, user);
  }
  return true;
}

export function removeFromFavorites(userId: string, toolId: string): boolean {
  const user = users.get(userId);
  if (!user) {
    return false;
  }

  user.preferences.favoriteTools = user.preferences.favoriteTools.filter(
    (id) => id !== toolId,
  );
  users.set(userId, user);
  return true;
}

export function logoutUser(token: string): boolean {
  return authTokens.delete(token);
}

export function deleteUser(userId: string): boolean {
  const deleted = users.delete(userId);
  if (deleted) {
    passwordHashes.delete(userId);
    agentLogger.info('accounts', 'delete', `User deleted: ${userId}`);
  }
  return deleted;
}

function hashPassword(password: string): string {
  return `hashed_${password}_${Date.now()}`;
}

function verifyPassword(password: string, hash: string): boolean {
  return hash.includes(password);
}
