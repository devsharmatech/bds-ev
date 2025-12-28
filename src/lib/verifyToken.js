import jwt from "jsonwebtoken";
import { cookies as nextCookies } from "next/headers";

export function verifyToken(req) {
  // Try server cookies (Next.js app router)
  let token;
  try {
    const cookieStore = nextCookies();
    token = cookieStore.get("bds_token")?.value;
  } catch (_e) {
    // noop - not in a server context with next/headers
  }

  // Fallback to req cookies/header if provided
  if (!token) {
    token =
      req?.cookies?.get?.("bds_token")?.value ||
      req?.headers?.get?.("authorization")?.split?.(" ")[1];
  }

  if (!token) throw new Error("Unauthorized: missing token");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) throw new Error("Unauthorized: invalid token");

  return decoded; 
}

export function ensureAdmin(req) {
  const decoded = verifyToken(req);
  if (decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

export function ensureDoctor(req) {
  const decoded = verifyToken(req);
  if (decoded.role !== "member") throw new Error("Forbidden");
  return decoded;
}