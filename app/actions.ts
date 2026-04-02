'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByEmail, getUserById, getUsersByFilter, updatePasswordByUserId, updatePasswordResetCode, resetPassword as resetPw } from '@/library/users.repository';
import { getBusinessById, updateUserStatus } from '@/library/dashboard.repository';
import { validatePassword, hashPassword, generateToken, validateToken } from '@/library/auth.helpers';
import type { UserSearchFiltration, SearchResult, UserViewModel } from '@/library/types';
import { Status } from '@/library/types';
import crypto from 'crypto';

// --- Auth ---

export async function login(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return { error: 'Invalid email or password' };

  const valid = await validatePassword(password, user.Password);
  if (!valid) return { error: 'Invalid email or password' };

  const token = generateToken(user.Id, user.Email, user.RoleId, user.Status ?? null, user.BusinessId ?? 0);

  const cookieStore = await cookies();
  cookieStore.set('usertoken', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return {
    user: {
      Id: user.Id,
      Email: user.Email,
      FirstName: user.FirstName,
      LastName: user.LastName,
      RoleId: user.RoleId,
    },
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('usertoken');
  redirect('/login');
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('usertoken')?.value;
  if (!token) return null;

  const payload = validateToken(token);
  return payload;
}

export async function forgotPassword(email: string) {
  const user = await getUserByEmail(email);
  if (!user) return { success: true }; // don't reveal if email exists

  const code = crypto.randomBytes(5).toString('hex').substring(0, 10);
  await updatePasswordResetCode(email, code);
  // TODO: send email with reset code/link
  return { success: true };
}

export async function resetPassword(code: string, newPassword: string) {
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters' };

  const hashed = await hashPassword(newPassword);
  const result = await resetPw(code, hashed);
  if (result === 0) return { error: 'Invalid or expired reset code' };
  return { success: true };
}

// --- Users / Business ---

export async function fetchUsers(filter: UserSearchFiltration): Promise<SearchResult<UserViewModel>> {
  return getUsersByFilter(filter);
}

export async function fetchUserById(id: number) {
  const user = await getUserById(id);
  if (!user) return null;
  const { Password, ...safeUser } = user;
  return safeUser;
}

export async function fetchBusinessById(id: number) {
  const session = await getSession();
  if (!session) return null;
  return getBusinessById(id, session.UserId);
}

export async function adminResetUserPassword(userId: number, newPassword: string) {
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters' };

  const hashed = await hashPassword(newPassword);
  const result = await updatePasswordByUserId(userId, hashed);
  return { success: result > 0 };
}

export async function deleteUser(userId: number, reason: string) {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  const result = await updateUserStatus(userId, Status.Delete, reason);
  return { success: result > 0 };
}

export async function changePassword(oldPassword: string, newPassword: string) {
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters' };

  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  const user = await getUserById(session.UserId);
  if (!user) return { error: 'User not found' };

  const valid = await validatePassword(oldPassword, user.Password);
  if (!valid) return { error: 'Old password is incorrect' };

  const hashed = await hashPassword(newPassword);
  await updatePasswordByUserId(session.UserId, hashed);
  return { success: true };
}
