"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        throw new Error('Failed to add user');
      }

      alert('User added!');
      setName('');
      setEmail('');

      // Refresh the user list
      const updatedRes = await fetch('/api/data');
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setUsers(updatedData.users);
      }
    } catch (error) {
      console.error('Error submitting user:', error);
    }
  };

  return (
    <div>
      <h1>Users List</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name} ({user.email})</li>
        ))}
      </ul>

      <h2>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}
