import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

const clientId = process.env.AUTH_GITHUB_ID;
const clientSecret = process.env.AUTH_GITHUB_SECRET;

if (!clientId || !clientSecret) {
  throw new Error('AUTH_GITHUB_ID and AUTH_GITHUB_SECRET must be defined');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId,
      clientSecret
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === '/login';

      switch (true) {
        case isLoggedIn && isLoginPage:
          return Response.redirect(new URL('/', nextUrl));

        case isLoginPage:
          return true;

        default:
          return isLoggedIn;
      }
    }
  }
});
