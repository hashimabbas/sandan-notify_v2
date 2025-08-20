import clientPromise from '../../../lib/mongodb'; 
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from "bcrypt";

async function login(credentials) {
  try {
    const client = await clientPromise;
    const db = client.db('notify_app');
    const user = await db.collection("users").findOne({ email: credentials.email });
    
    if (!user) {
      throw new Error("Wrong Credentials.");
    }
    
    const isCorrect = await bcrypt.compare(credentials.password, user.password);
    
    if (!isCorrect) {
      throw new Error("Wrong Credentials.");
    }
    
    return user;
  } catch (error) {
    console.log("Error while logging in:", error);
    throw new Error("Something went wrong.");
  }
}

export const authOptions = {
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        try {
          const user = await login(credentials);
          return user;
        } catch (error) {
          throw new Error("Failed to login");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.email = user.email;
        token.id = user._id;  // MongoDB uses _id for the user ID
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
