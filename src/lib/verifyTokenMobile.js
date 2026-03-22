import jwt from "jsonwebtoken";

/**
 * Mobile token verification – reads JWT exclusively from the
 * Authorization: Bearer <token> header. Never touches cookies.
 */
export function verifyTokenMobile(req) {
  const authHeader = req?.headers?.get?.("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) throw new Error("Unauthorized: missing token");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) throw new Error("Unauthorized: invalid token");

  return decoded;
}
