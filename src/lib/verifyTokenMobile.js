import jwt from "jsonwebtoken";

/**
 * Mobile token verification – reads JWT exclusively from the
 * Authorization: Bearer <token> header. Never touches cookies.
 */
export function verifyTokenMobile(req) {
  const authHeader = req?.headers?.get?.("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) throw new Error("Missing authentication token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) throw new Error("Invalid token payload");
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error("Authentication token has expired");
    }
    throw new Error("Invalid authentication token");
  }
}
