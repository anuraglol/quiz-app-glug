import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { SignInClient } from "./sign-in-client";

export default async function Page() {
  const session = await getServerSession(await headers());

  // Already logged in? Redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return <SignInClient />;
}
