import { auth } from "./auth";
import { headers } from "next/headers";
import type { User, Session } from "./db";

export type ServerSession = {
  session: Session;
  user: User;
} | null;

export async function getServerSession(): Promise<ServerSession> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return session as ServerSession;
}
