"use client";
import Header from '@/app/pages/components/header';
import HeroSection from '@/app/pages/components/hero';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast"; // Adjust import path if needed

export default function Register() {
  const [info, setInfo] = useState({ username: "", email: "", password: "", isAdmin: "0" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  function handleInput(e) {
    setInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    setError("");

    if (!info.username || !info.email || !info.password) {
      setError("All fields are required.");
      return;
    }

    try {
      setPending(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
      });

      if (res.ok) {
        setPending(false);
        console.log("User registered successfully.");
        toast({
          description: "User registered successfully.",
          duration: 5000,
          style: {
            background: "#27ae60",
            color: "#FFFFFF",
          },
        });
        setInfo({ username: "", email: "", password: "", isAdmin: "0" });
      } else {
        const errorData = await res.json();
        setError(errorData.message);
        setPending(false);
      }
    } catch (error) {
      setPending(false);
      setError("Something went wrong. Please try again later.");
      console.error("Error during registration:", error);
    }
  }

  return (
    <>
      <Header />
      <HeroSection />
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100">
        <div className="w-full max-w-lg bg-white shadow-xl rounded-lg p-10">
          <h2 className="text-3xl font-extrabold text-center text-orange-600 mb-8">Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={info.username}
                onChange={handleInput}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={info.email}
                onChange={handleInput}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={info.password}
                onChange={handleInput}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="isAdmin">
                Role
              </label>
              <select
                className="shadow-sm border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                name="isAdmin"
                id="isAdmin"
                value={info.isAdmin}
                onChange={handleInput}
              >
                <option value="0">User</option>
                <option value="1">Admin</option>
              </select>
            </div>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <div className="flex items-center justify-between">
              <button
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 w-full"
                type="submit"
                disabled={pending}
              >
                {pending ? "Registering..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster/>
    </>
  );
}
