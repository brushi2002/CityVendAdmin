import { getPool, sql } from './db';
import type { BusinessDetails, BusinessHour, UserFile, BusinessTypeMaster, BusinessCategoryMaster, Hotspot } from './types';
import { getStatusText, getBusinessGroupName } from './types';

export async function getBusinessById(id: number, userId: number): Promise<BusinessDetails | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .input('UserId', sql.Int, userId)
    .execute('BusinessGetById');

  const recordsets = result.recordsets as any[];
  if (!recordsets[0] || recordsets[0].length === 0) return null;

  const row = recordsets[0][0];
  const business: BusinessDetails = {
    ...row,
    StatusText: getStatusText(row.Status),
    GroupName: getBusinessGroupName(row.GroupId),
    Hours: (recordsets[1] ?? []) as BusinessHour[],
    Files: (recordsets[2] ?? []) as UserFile[],
  };

  return business;
}

export async function getBusinessTypes(): Promise<BusinessTypeMaster[]> {
  const pool = await getPool();
  const result = await pool.request().execute('BusinessTypeMasterGet');
  return result.recordset as BusinessTypeMaster[];
}

export async function getBusinessCategories(): Promise<BusinessCategoryMaster[]> {
  const pool = await getPool();
  const result = await pool.request().execute('BusinessCategoryMasterGet');
  return result.recordset as BusinessCategoryMaster[];
}

export async function getHotspotsByBusinessId(businessId: number): Promise<Hotspot[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('BusinessId', sql.Int, businessId)
    .execute('HotspotsGetByBusinessId');
  return result.recordset as Hotspot[];
}

export async function updateUserStatus(userId: number, status: number, accountDeleteReason: string): Promise<number> {
  const pool = await getPool();
  const result = await pool.request()
    .input('UserId', sql.Int, userId)
    .input('Status', sql.Int, status)
    .input('AccountDeleteReason', sql.NVarChar(sql.MAX), accountDeleteReason)
    .execute('UserStatusUpdate');
  return result.rowsAffected[0] ?? 0;
}
