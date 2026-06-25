import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
