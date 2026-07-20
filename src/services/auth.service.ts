import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { users } from "../db/schema/userschema";
import { AppError } from "../utils/errors";
import * as bcrypt from "bcryptjs";
import { redis } from '../config/redis'
import { signAccessToken, signRefreshToken, getRemainingTtl, verifyRefreshToken } from "../utils/jwt";

const BCRYPT_ROUNDS = 12;

type SafeUser = {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  fullName: string;
};

async function issueToken(user: SafeUser) {
  const payload = { sub: user.id, email: user.email, role: user.role }
  const { token: AccessToken } = signAccessToken(payload)
  const { token: RefreshToken, jti: Refreshjti } = signRefreshToken(payload)

  const ttl = getRemainingTtl(RefreshToken)
  await redis.set(`refresh:valid:${Refreshjti}`, user.id, 'EX', ttl)

  return { AccessToken, RefreshToken, user }
}

export async function register(fullName: string, email: string, password: string) {
  if (!fullName || !email || !password) {
    throw new AppError(400, "BAD_REQUEST", "All fields are required");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existingUser) {
    throw new AppError(409, "CONFLICT", "Email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 2. The Drizzle Insert Magic
  const [user] = await db
    .insert(users)
    .values({
      fullName,
      email,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role
    }); // .returning() is a Postgres superpower. It gives you back the newly created row (with the generated UUID)!
  return issueToken(user);
}

export async function login(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: {
      id: true,
      email: true,
      password: true,
      role: true,
      fullName: true
    },
  })
  //console.log(user)

  if (!user)
    throw new AppError(401, "INVALID", "user does not exist")

  const valid = await bcrypt.compare(password, user.password)
  if (!valid)
    throw new AppError(401, "INVALID", "invalid email or password")

  return issueToken({ id: user.id, email: user.email, role: user.role, fullName: user.fullName })
}

export async function refresh(token: string) {
  let payload: ReturnType<typeof verifyRefreshToken>;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(
      401,
      "INVALID_REFRESH_TOKEN",
      "Invalid or expired refresh token"
    );
  }

  const storedToken = await redis.get(`refresh:valid:${payload.jti}`)
  if (!storedToken)
    throw new AppError(401, "REFRESH_TOKEN_USED", "refresh token already used")

  await redis.del(`refresh:valid:${payload.jti}`)

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.sub),
    columns: { id: true, email: true, role: true, fullName: true },
  });

  if (!user) {
    throw new AppError(401, 'USER_INACTIVE', 'Account is inactive');
  }

  return issueToken({
    id: user.id,
    email: user.email,
    role: user.role as 'customer' | 'admin',
    fullName: user.fullName,
  });
}

export async function getMe(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, fullName: true, role: true, email: true, createdAt: true, phone: true }
  })

  if (!user) {
    throw new AppError(404, 'USER_INACTIVE', 'User not found');
  }
  return user

}

export async function logout(refreshToken: string, accessJti: string, accessToken: string) {
  let payload: ReturnType<typeof verifyRefreshToken>;

  try {
    payload = verifyRefreshToken(refreshToken);
    console.log(payload)
    await redis.del(`refresh:valid:${payload.jti}`)
  } catch {
  }

  if (accessJti && accessToken) {
    const ttl = getRemainingTtl(accessJti)
    if (ttl > 0) {
      await redis.set(`blocklist:${accessJti}`, '1', 'EX', ttl)
    }
  }
}