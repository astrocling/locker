import { auth } from "@/auth";

export type AuthSession = {
  name: string;
  email: string;
};

export async function requireAuthSession(): Promise<AuthSession | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return null;
  }
  return {
    email,
    name: session.user?.name ?? email,
  };
}
