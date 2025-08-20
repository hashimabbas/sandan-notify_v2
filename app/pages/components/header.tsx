import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const Header = () => {
  const { data: session } = useSession();
  console.log("is admin" + session?.user?.isAmin);
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-600">
          Sandan Development
        </h1>
        <div className="space-x-4 flex items-center">
          <a href="/" className="text-gray-600 hover:text-orange-600">
            Home
          </a>
          <a
            href="/pages/data_showing"
            className="text-gray-600 hover:text-orange-600"
          >
            Owners Payable
          </a>
          <a
            href="/pages/rent_receivable_showing"
            className="text-gray-600 hover:text-orange-600"
          >
            Rent Receivables
          </a>
          <a
            href="/pages/send_text_message_showing"
            className="text-gray-600 hover:text-orange-600"
          >
            Send WhatsApp Message
          </a>
          {session?.user?.isAdmin == "1" ? (
            <a href="/register" className="text-gray-600 hover:text-orange-600">
              Register User
            </a>
          ) : (
            ""
          )}
          {session?.user?.isAdmin == "1" ? (
            <a
              href="/pages/users_managment"
              className="text-gray-600 hover:text-orange-600"
            >
              Users Managment
            </a>
          ) : (
            ""
          )}
          {session ? (
            <div className="flex items-center space-x-2">
              <button
                className="text-orange-600 hover:text-orange-800"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="text-orange-600 hover:text-orange-800"
              onClick={() => signIn()}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;