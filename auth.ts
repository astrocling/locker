import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const SESSION_MAX_AGE_SECONDS = 10 * 365 * 24 * 60 * 60; // 10 years

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    signIn({ user }) {
      const allowed =
        process.env.ALLOWED_EMAILS?.split(",").map((e) => e.trim()) ?? [];
      return allowed.includes(user.email ?? "") ? true : "/not-authorized";
    },
  },
});
