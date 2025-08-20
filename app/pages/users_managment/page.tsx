"use client";
import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/toast"; // Adjust import path if needed
import { useToast } from "@/hooks/use-toast"; // Adjust import path if needed
import { Toaster } from "@/components/ui/toaster";
import Header from "../components/header";
import HeroSection from "../components/hero";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // For editing modal
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch users on component mount
  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/get_users");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  // Delete a user
  async function deleteUser(id) {
    try {
      const res = await fetch("/api/delete_user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }), // Pass the correct id here
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          description: `User deleted successfully.`,
          duration: 5000,
          style: {
            background: "#e74c3c", // Red background
            color: "#FFFFFF", // White text
            border: "1px solid #e74c3c", // Border color
          },
        });
        setUsers(users.filter((user) => user._id !== id)); // Remove the deleted user
      } else {
        console.error("Failed to delete user:", res.status);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  // Save changes to user
  async function saveUser(updatedUser) {
    try {
      const res = await fetch(`/api/update_user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        const newUser = await res.json();
        toast({
          description: `User updated successfully.`,
          duration: 5000,
          style: {
            background: "#27ae60", // Green background
            color: "#FFFFFF", // White text
            border: "1px solid #27ae60", // Border color
          },
        });
        // Update the users list with the updated user
        setUsers(
          users.map((user) =>
            user._id === updatedUser._id ? updatedUser : user
          )
        );
        setEditingUser(null); // Close editing form/modal
      } else {
        console.error("Failed to update user:", res.status);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  if (loading) return <div>Loading users...</div>;

  return (
    <>
      <Header />
      <HeroSection />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Username</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left">{user.username}</td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-left">
                  {user.isAdmin ? "Admin" : "User"}
                </td>
                <td className="py-3 px-6 text-right space-x-2">
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                    onClick={() => setEditingUser(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white py-1 px-3 rounded"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Editing Form Modal (You can use a modal library or keep it simple) */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
              <h2 className="text-2xl mb-4">Edit User</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveUser(editingUser);
                }}
              >
                <div className="mb-4">
                  <label className="block text-gray-700">Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        username: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        password: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Role</label>
                  <select
                    value={editingUser.isAdmin}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        isAdmin: e.target.value === "1",
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="0">User</option>
                    <option value="1">Admin</option>
                  </select>
                </div>
                <input type="hidden" name="id" value={editingUser._id} />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="bg-gray-500 text-white py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </>
  );
}
