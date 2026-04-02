import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { JWTAuthPayload } from './types';

const SALT_BYTE_SIZE = 24;
const HASH_BYTE_SIZE = 20;
const PBKDF2_ITERATIONS = 50000;

function getJwtSecret(): string {
  return process.env.JWT_SECRET!;
}

// --- Password hashing (compatible with .NET Rfc2898DeriveBytes / SHA1) ---

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_BYTE_SIZE);
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, HASH_BYTE_SIZE, 'sha1', (err, hash) => {
      if (err) return reject(err);
      resolve(`${PBKDF2_ITERATIONS}:${salt.toString('base64')}:${hash.toString('base64')}`);
    });
  });
}

export function validatePassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = storedHash.split(':');
    const iterations = parseInt(parts[0], 10);
    const salt = Buffer.from(parts[1], 'base64');
    const hash = Buffer.from(parts[2], 'base64');

    crypto.pbkdf2(password, salt, iterations, hash.length, 'sha1', (err, derivedHash) => {
      if (err) return reject(err);
      // Constant-time comparison
      resolve(crypto.timingSafeEqual(hash, derivedHash));
    });
  });
}

// --- JWT (compatible with existing .NET JWTHelper / HS256) ---

export function generateToken(userId: number, email: string, roleId: number, status: number | null, businessId: number): string {
  const payload: JWTAuthPayload = {
    UserId: userId,
    Email: email,
    RoleId: roleId,
    Status: status,
    BusinessId: businessId,
    TokenIssuedOn: new Date().toISOString(),
    Issuer: process.env.SITE_URL || '',
  };

  // Sign without exp — we check TokenIssuedOn manually to match .NET behavior
  return jwt.sign(payload, getJwtSecret(), { algorithm: 'HS256' });
}

export function parseToken(token: string): JWTAuthPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as JWTAuthPayload;
    return decoded;
  } catch {
    return null;
  }
}

const JWT_LIFE_DAYS = 7;

export function validateToken(token: string): JWTAuthPayload | null {
  const payload = parseToken(token);
  if (!payload) return null;

  const issuedOn = new Date(payload.TokenIssuedOn);
  const expiresAt = new Date(issuedOn.getTime() + JWT_LIFE_DAYS * 24 * 60 * 60 * 1000);
  if (expiresAt < new Date()) return null;

  return payload;
}
