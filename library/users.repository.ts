import { getPool, sql } from './db';
import type { User, UserViewModel, UserSearchFiltration, SearchResult } from './types';
import { getStatusText } from './types';

export async function getUserByEmail(email: string): Promise<User | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('Email', sql.NVarChar, email)
    .execute('UsersGetByEmail');

  if (result.recordset.length === 0) return null;
  return result.recordset[0] as User;
}

export async function getUserById(userId: number): Promise<User | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('UserId', sql.Int, userId)
    .execute('UsersGetById');

  if (result.recordset.length === 0) return null;
  return result.recordset[0] as User;
}

export async function getUsersByFilter(filter: UserSearchFiltration): Promise<SearchResult<UserViewModel>> {
  const pool = await getPool();
  const request = pool.request()
    .input('PageIndex', sql.Int, filter.PageIndex ?? 1)
    .input('PageSize', sql.Int, filter.PageSize ?? 10)
    .input('IsPaging', sql.Int, filter.IsPaging ?? 1)
    .input('Email', sql.NVarChar, filter.UserEmail ?? null)
    .input('Name', sql.NVarChar, filter.UserName ?? null)
    .input('Status', sql.Int, filter.Status ?? null)
    .input('Role', sql.Int, filter.Role ?? null)
    .output('TotalPages', sql.Int)
    .output('TotalData', sql.Int)
    .output('StartRow', sql.Int)
    .output('EndRow', sql.Int);

  if (filter.OrderBy) {
    request.input('OrderBy', sql.NVarChar, filter.OrderBy);
  }
  if (filter.OrderByDirection && filter.OrderByDirection > 0) {
    request.input('OrderByDirection', sql.Int, filter.OrderByDirection);
  }

  const result = await request.execute('UsersGetByFiltration');

  const rows = result.recordset.map((row: any) => ({
    ...row,
    StatusText: getStatusText(row.Status),
  })) as UserViewModel[];

  return {
    ResultData: rows,
    RowCount: result.output.TotalData ?? 0,
    TotalPages: result.output.TotalPages ?? 0,
    StartRow: result.output.StartRow ?? 0,
    EndRow: result.output.EndRow ?? 0,
  };
}

export async function updatePasswordResetCode(email: string, passwordResetCode: string): Promise<number> {
  const pool = await getPool();
  const result = await pool.request()
    .input('Email', sql.NVarChar, email)
    .input('PasswordResetCode', sql.NVarChar, passwordResetCode)
    .execute('UsersUpdatePasswordResetCode');
  return result.rowsAffected[0] ?? 0;
}

export async function resetPassword(passwordResetCode: string, hashedPassword: string): Promise<number> {
  const pool = await getPool();
  const result = await pool.request()
    .input('Password', sql.NVarChar, hashedPassword)
    .input('PasswordResetCode', sql.NVarChar, passwordResetCode)
    .execute('UsersForgotPasswordReset');
  return result.rowsAffected[0] ?? 0;
}

export async function updatePasswordByUserId(userId: number, hashedPassword: string): Promise<number> {
  const pool = await getPool();
  const result = await pool.request()
    .input('Id', sql.Int, userId)
    .input('Password', sql.NVarChar, hashedPassword)
    .execute('UsersUpdatePassword');
  return result.rowsAffected[0] ?? 0;
}
