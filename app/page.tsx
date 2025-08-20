"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "./pages/components/header";
import HeroSection from "./pages/components/hero";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [file2, setFile2] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleRentFileChange = (e) => {
    setFile2(e.target.files[0]);
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
            border: "1px solid #388E3C", // Border color
          },
         
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();

    if (!file2) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file2);

    try {
      const res = await fetch("/api/upload_sheet_rent_receivables", {
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
            border: "1px solid #388E3C", // Border color
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
      {/* Header Section */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Section */}
      <main className="container mx-auto flex flex-col items-center justify-center py-10 space-y-8">
        {/* Owners Payable and Rent & Receivable Section */}
        <section className="w-full flex flex-col md:flex-row justify-center items-center gap-6">
          {/* Owners Payable Upload Section */}
          <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2 lg:w-1/3">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Upload Owners Payable Excel File
            </h3>
            <form onSubmit={handleSubmit}>
              <Label htmlFor="file" className="block text-gray-700 mb-2">
                Please Choose the File
              </Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="w-full mb-4"
              />
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Upload
              </Button>
            </form>
            <p className="text-gray-500 mt-2 text-center">
              Supported file formats: .xlsx, .xls
            </p>
          </div>

          {/* Rent & Receivable Upload Section */}
          <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2 lg:w-1/3">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Upload Rent & Receivable Excel File
            </h3>
            <form onSubmit={handleRentSubmit}>
              <Label htmlFor="file" className="block text-gray-700 mb-2">
                Please Choose the File
              </Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleRentFileChange}
                className="w-full mb-4"
              />
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Upload
              </Button>
            </form>
            <p className="text-gray-500 mt-2 text-center">
              Supported file formats: .xlsx, .xls
            </p>
          </div>
        </section>

        {/* Display Data Section */}
        <section className="w-full flex flex-col md:flex-row justify-center items-center gap-6">
          {/* Owners Payable Data Display Section */}
          <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2 lg:w-1/3">
            <h4 className="text-xl text-center mb-4">View Owners Payable Data</h4>
            <Link href="/pages/data_showing">
              <Button
                type="button"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Display Data
              </Button>
            </Link>
          </div>

          {/* Rent & Receivable Data Display Section */}
          <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2 lg:w-1/3">
            <h4 className="text-xl text-center mb-4">View Rent & Receivable Data</h4>
            <Link href="/pages/rent_receivable_showing">
              <Button
                type="button"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Display Data
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-center py-4 mt-auto">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} Sandan Development Powered By Intaj
          Starts Technology. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
