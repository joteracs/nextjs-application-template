import { cookies } from 'next/headers';
import db from './db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cfp-xii-secret-key';

export async function createSession(userId) {
  const sessionToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
  await db.updateUserSession(userId, sessionToken);
  
  return sessionToken;
}

export async function validateSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session-token');
  
  if (!token) return null;

  try {
    const decoded = jwt.verify(token.value, JWT_SECRET);
    const user = await db.validateSession(decoded.userId, token.value);
    
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type
    };
  } catch (error) {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session-token');
  
  if (token) {
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET);
      await db.clearUserSession(decoded.userId);
    } catch (error) {
      // Ignore errors during logout
    }
  }
  
  cookieStore.delete('session-token');
}

export async function login(email, password) {
  const user = await db.getUserByEmail(email);
  
  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const isValidPassword = await db.verifyPassword(password, user.password);
  
  if (!isValidPassword) {
    throw new Error('Senha incorreta');
  }

  if (!user.is_active) {
    throw new Error('Usuário desativado');
  }

  const sessionToken = await createSession(user.id);
  
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type
    },
    sessionToken
  };
}
