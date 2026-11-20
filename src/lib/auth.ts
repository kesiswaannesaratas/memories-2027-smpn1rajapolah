import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'memories-2027-smpn1rajapolah-super-secret-key-yearbook';
const COOKIE_NAME = 'memories_session_token';

export interface SessionUser {
  id: string;
  username: string;
  email: string | null;
  role: 'ADMIN' | 'STUDENT';
  studentId: string | null;
  classId: string | null;
  fullName?: string;
  className?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  const verified = verifyToken(token);
  if (!verified) return null;

  // Optionally verify active in DB
  const user = await prisma.user.findUnique({
    where: { id: verified.id },
    include: {
      student: { select: { fullName: true } },
      class: { select: { className: true } },
    },
  });

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role as 'ADMIN' | 'STUDENT',
    studentId: user.studentId,
    classId: user.classId,
    fullName: user.student?.fullName || user.username,
    className: user.class?.className || undefined,
  };
}

export { COOKIE_NAME };
