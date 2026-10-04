import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET must be configured.");
  return new TextEncoder().encode(value);
};
export async function hashPassword(value: string) {
  return bcrypt.hash(value.trim(), 10);
}
export async function verifyPassword(value: string, hash?: string | null) {
  return Boolean(hash && (await bcrypt.compare(value.trim(), hash)));
}
export async function signToken(payload: JWTPayload, ttlSeconds: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret());
}
export async function decodeToken(token?: string | null) {
  if (!token) return null;
  try {
    return (await jwtVerify(token.trim(), secret(), { algorithms: ["HS256"] }))
      .payload;
  } catch {
    return null;
  }
}
export function bearer(request: Request) {
  const raw =
    request.headers.get("authorization") ||
    request.headers.get("x-web-token") ||
    "";
  return raw.toLowerCase().startsWith("bearer ")
    ? raw.slice(7).trim()
    : raw.trim();
}
export async function requireAdmin(request: Request) {
  const payload = await decodeToken(bearer(request));
  if (!payload?.userId || !payload?.username)
    throw new ApiError(401, "توکن ورود منقضی شده است.");
  return payload;
}
export async function requireWebUser(request: Request) {
  const payload = await decodeToken(bearer(request));
  if (!payload?.userId || !payload?.email)
    throw new ApiError(401, "نشست شما منقضی شده. لطفاً دوباره وارد شوید.");
  return payload;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
