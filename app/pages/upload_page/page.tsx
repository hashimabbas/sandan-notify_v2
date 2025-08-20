"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import UploadLogoForm from "../components/UploadLogoForm";

export default function UploadPage() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload_sheet", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      toast(
        `File uploaded successfully. ${data.insertedCount} records inserted.`,
        {
          duration: 5000,
          style: {
            background: "#4CAF50", // Green background
            color: "#FFFFFF", // White text
            border: "1px solid #388E3C", // White text
          },
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">LinkinCard</h1>
          <div className="space-x-4">
            <a href="#" className="text-gray-600 hover:text-orange-600">Home</a>
            <a href="#" className="text-gray-600 hover:text-orange-600">Profile</a>
            <a href="#" className="text-gray-600 hover:text-orange-600">Help</a>
            <a href="#" className="text-gray-600 hover:text-orange-600">Logout</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-orange-500 text-white text-center py-10">
        <h2 className="text-4xl font-bold mb-2">Welcome to LinkinCard!</h2>
        <p className="text-lg">Manage and share your business cards easily.</p>
      </section>

      {/* Content Section */}
      <main className="container mx-auto flex flex-col items-center justify-center py-10">
        {/* How to Use */}
        <section className="bg-white shadow-md rounded-lg p-6 mb-8 w-full md:w-3/4 lg:w-1/2">
          <h3 className="text-2xl font-bold mb-4">How to Use the App</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Step 1: Register and log in to your account.</li>
            <li>Step 2: Upload your business card data using the form below.</li>
            <li>Step 3: View and manage your uploaded cards from your profile.</li>
            <li>Step 4: Share your cards with others directly from the app.</li>
          </ul>
        </section>

        {/* Upload Section */}
        <section className="bg-white shadow-md rounded-lg p-6 w-full md:w-3/4 lg:w-1/2">
          <h3 className="text-2xl font-bold mb-4">Upload Your Business Card Data</h3>
          <form onSubmit={handleSubmit}>
            <Label htmlFor="file" className="block text-gray-700 mb-2">
              Please Choose The File
            </Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full mb-4"
            />
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              Upload
            </Button>
          </form>
          <p className="text-gray-500 mt-2 text-center">
            Supported file formats: .xlsx, .xls
          </p>
        </section>

        {/* Upload Logo*/}
        <UploadLogoForm />
      </main>

      {/* Footer */}
      <footer className="bg-white text-center py-4 mt-auto">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} LinkinCard. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
