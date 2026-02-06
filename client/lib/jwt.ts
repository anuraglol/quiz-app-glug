import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface UserJWTPayload extends JWTPayload {
  sub: string;
  email: string;
  name: string;
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

export async function signUserJWT(user: {
  id: string;
  email: string;
  name: string;
}): Promise<string> {
  const secret = getSecret();

  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret);

  return token;
}

export async function verifyUserJWT(token: string): Promise<UserJWTPayload> {
  const secret = getSecret();

  const { payload } = await jwtVerify(token, secret);

  if (!payload.sub || !payload.email || !payload.name) {
    throw new Error("Invalid JWT payload");
  }

  return payload as UserJWTPayload;
}
