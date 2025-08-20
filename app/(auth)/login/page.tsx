"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function Login() {
  const router = useRouter();
  const [info, setInfo] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!info.email || !info.password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(""); // Clear error if fields are filled

    try {
      setPending(true);
      const res = await signIn("credentials", {
        email: info.email,
        password: info.password,
        redirect: false
      });
      if (res?.error) {
        setError("Invalid credentials. Please try again.");
        setPending(false);
        return;
      }
      router.replace("/");
    } catch (err) {
      setPending(false);
      setError("Something went wrong. Please try again later.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600">Email</label>
            <input
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500 focus:border-orange-500"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={info.email}
              onChange={handleInput}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">Password</label>
            <input
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500 focus:border-orange-500"
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={info.password}
              onChange={handleInput}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            className={`w-full py-2 text-white font-semibold rounded-lg ${pending ? "bg-orange-400" : "bg-orange-600 hover:bg-orange-700"} focus:outline-none focus:ring focus:ring-blue-500`}
            type="submit"
            disabled={pending}
          >
            {pending ? "Logging in..." : "Login"}
          </button>
        </form>
        
      </div>
    </div>
  );
}
