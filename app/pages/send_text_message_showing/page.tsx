"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "../components/header";
import HeroSection from "../components/hero";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";

type SheetData = {
  Unit: string;
  Name_of_Owner: string;
  Owner_ID_No: string;
  Contact: string;
};

export default function Home() {
  const [data, setData] = useState<SheetData[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState(""); // State for the message input
  const { toast } = useToast();

  // Fetch data from API on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/get_sheet");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const result: SheetData[] = await res.json();
        setData(result);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
      }
    }
    fetchData();
  }, []);

  // Periodically send messages using setInterval
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleSendMessage();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [data, selectedRows]);

  // Select/Deselect a row
  const handleSelectRow = (Contact: string) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(Contact)
        ? prevSelected.filter((row) => row !== Contact)
        : [...prevSelected, Contact]
    );
  };

  // Select/Deselect all rows
  const handleSelectAllRows = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      const allContacts = data.map((item) => item.Contact);
      setSelectedRows(allContacts);
    }
    setSelectAll(!selectAll);
  };

  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Send messages to selected contacts
  const handleSendMessage = async () => {
    if (selectedRows.length === 0) {
      toast({ description: "No rows selected." });
      return;
    }

    if (!message) {
      toast({ description: "Message is required." });
      return;
    }

    try {
      const res = await fetch("/api/send_message_for_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: selectedRows,
          message: message,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to send messages: ${res.status}`);
      }

      toast({
        description: `Message sent to ${selectedRows.length} contact(s) successfully.`,
        duration: 5000,
        style: { background: "#27ae60", color: "#FFFFFF" },
      });

      setSelectedRows([]); // Clear the selection
      setMessage(""); // Clear the message input
    } catch (error) {
      console.error("Error sending messages:", error);
      toast({
        description: "Error sending messages.",
        duration: 5000,
        style: { background: "#c0392b", color: "#FFFFFF" },
      });
    }
  };

  return (
    <>
      <Header />
      <HeroSection />
      <NextNProgress
        color="#29D"
        startPosition={0.3}
        stopDelayMs={200}
        height={4}
        showOnShallow={true}
      />
      <div className="container mx-auto p-4">
        <main>
          {error && <div className="text-red-500">Error: {error}</div>}

          {/* Message input */}
          <div className="mb-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message:
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type your message here..."
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="mb-4 flex flex-wrap justify-between">
            <Button
              variant="outline"
              onClick={handleSendMessage}
              disabled={selectedRows.length === 0 || !message}
            >
              Send Message to Selected
            </Button>
          </div>

          {/* Table of contacts */}
          <div className="overflow-x-auto">
            <Table className="min-w-full table-auto">
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={selectAll}
                      onChange={handleSelectAllRows}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">Unit</TableHead>
                  <TableHead>Name Of Owner</TableHead>
                  <TableHead>Owner ID No</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Select row for contact ${result.Contact}`}
                        checked={selectedRows.includes(result.Contact)}
                        onChange={() => handleSelectRow(result.Contact)}
                      />
                    </TableCell>
                    <TableCell>{result.Unit}</TableCell>
                    <TableCell>{result.Name_of_Owner}</TableCell>
                    <TableCell>{result.Owner_ID_No}</TableCell>
                    <TableCell>{result.Contact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
      <Toaster />
    </>
  );
}