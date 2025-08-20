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
import { useToast } from "@/hooks/use-toast"; // Adjust import path if needed
import { Toast } from "@/components/ui/toast"; // Adjust import path if needed
import Header from "../components/header";
import HeroSection from "../components/hero";
import ConfirmationDialog from "@/app/pages/components/ConfirmationDialog";
import NextNProgress from "nextjs-progressbar";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";

type SheetData = {
  Unit: string;
  Name_of_Owner: string;
  Owner_ID_No: string;
  Contact: string;
  Community_Charge_up_to_2024_End: string;
  Rent_collected: string;
  Against_month_of: string;
  Leasing_Commission: string;
  Property_Management_Fee: string;
  VAT_on_Management_Fee_and_Commission: string;
  Municipality_Fee: string;
  Community: string;
  Maintenance: string;
  Payable_to_Owner: number;
  Community_charge_Carried_forward: number;
};

export default function Home() {
  const [data, setData] = useState<SheetData[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false); // Loading state for sending messages
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false); // State for dialog visibility
  const [rowsToDelete, setRowsToDelete] = useState<string[]>([]); // Rows pending deletion confirmation
  const [queue, setQueue] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState(10); // Define batch size
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const currentYear = new Date().getFullYear();

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
      handleSendMessageSelected();
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

  // Show confirmation dialog before deleting selected rows
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      return;
    }
    setRowsToDelete(selectedRows);
    setShowDialog(true);
  };

  // Confirm deletion of selected rows
  const confirmDelete = async () => {
    try {
      const res = await fetch("/api/delete_records", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contacts: rowsToDelete }),
      });

      if (!res.ok) {
        throw new Error(`Failed to delete records. Status: ${res.status}`);
      }

      const remainingData = data.filter(
        (item) => !rowsToDelete.includes(item.Contact)
      );
      setData(remainingData);
      setSelectedRows([]);
      setRowsToDelete([]);
      toast({
        description: `${rowsToDelete.length} item(s) deleted successfully.`,
        duration: 5000,
        style: {
          background: "#27ae60", // Green background
          color: "#FFFFFF", // White text
          border: "1px solid #27ae60", // Border color
        },
      });
    } catch (error) {
      console.error("Error deleting records:", error);
      toast({
        description: "Error deleting records. Please try again.",
        duration: 5000,
        style: {
          background: "#c0392b",
          color: "#FFFFFF",
        },
      });
    } finally {
      setShowDialog(false);
    }
  };

  // Periodically send messages from the queue
  useEffect(() => {
    if (queue.length > 0 && !isSending) {
      const id = setInterval(() => {
        sendBatch();
      }, 10000);
      setIntervalId(id);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [queue, isSending]);

  // Add selected rows to the queue for sending
  const handleSendMessageSelected = () => {
    const selectedData = data.filter((item) =>
      selectedRows.includes(item.Contact)
    );
    if (selectedData.length === 0) {
      toast({ description: "No rows selected." });
      return;
    }
    setQueue([...queue, ...selectedData.map((item) => item.Contact)]);
    setSelectedRows([]);
    toast({
      description: "Messages added to the queue for sending.",
      duration: 5000,
      style: {
        background: "#27ae60",
        color: "#FFFFFF",
      },
    });
  };

  // Send messages in batches
  const sendBatch = async () => {
    try {
      // Get the current batch from the queue
      const batch = queue.slice(0, batchSize);
      const batchData = data.filter((item) => batch.includes(item.Contact)); // Get the data for the current batch

      console.log("Current Batch:", batch); // Debugging
      console.log("Batch Data:", batchData); // Debugging

      if (batchData.length > 0) {
        setIsSending(true); // Set the sending state to true

        const res = await fetch("/api/generate_and_send_pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedRows: batchData }),
        });

        if (!res.ok) throw new Error(`Failed to send messages: ${res.status}`);

        // Show toast notification for successful batch sending
        toast({
          description: `${batchData.length} messages sent successfully.`,
          duration: 5000,
          style: {
            background: "#27ae60",
            color: "#FFFFFF",
          },
        });
        // Remove sent contacts from the queue
        setQueue((prevQueue) => {
          const updatedQueue = prevQueue.slice(batchSize); // Slice based on batch size
          console.log("Updated Queue:", updatedQueue); // Debugging
          return updatedQueue;
        });

        // Remove sent contacts from data and update the UI
        setData((prevData) => {
          const updatedData = prevData.filter(
            (item) => !batch.includes(item.Contact)
          );
          console.log("Updated Data:", updatedData); // Debugging
          return updatedData;
        });

        // Remove sent contacts from selectedRows
        setSelectedRows((prevSelectedRows) => {
          const updatedSelectedRows = prevSelectedRows.filter(
            (contact) => !batch.includes(contact)
          );
          console.log("Updated Selected Rows:", updatedSelectedRows); // Debugging
          return updatedSelectedRows;
        });

        // Update progress
        setProgress((prevProgress) => {
          const totalRows = data.length; // Total initial data
          const sentRows =
            totalRows - queue.length + Math.min(batchSize, queue.length); // Ensure correct count even with small queues
          const newProgress = (sentRows / totalRows) * 100;
          console.log("Progress:", newProgress); // Debugging
          return newProgress;
        });

        // If queue is empty, stop the process and reset progress
        if (queue.length <= batchSize) {
          console.log("Queue is empty, completing..."); // Debugging
          setProgress(100); // Complete the progress bar
          toast({
            description: "All messages sent successfully!",
            duration: 5000,
            style: {
              background: "#27ae60",
              color: "#FFFFFF",
            },
          });
          setTimeout(() => {
            setProgress(0); // Reset progress after a short delay
            setQueue([]); // Clear the queue
          }, 2000);
        }
      } else {
        console.log("No batch data to send."); // Debugging
      }
    } catch (error) {
      console.error("Error sending messages:", error);
      toast({
        description: "Error sending messages.",
        duration: 5000,
        style: { background: "#c0392b", color: "#FFFFFF" },
      });
    } finally {
      setIsSending(false); // Reset the sending state
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

          {/** Loading Progress bar */}
          {isSending && (
            <div className="my-4">
              <div className="h-4 w-full bg-gray-200 rounded">
                <div
                  className="h-4 bg-blue-600 rounded"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p>{progress.toFixed()}% complete</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-4 flex flex-wrap justify-between">
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
            >
              Delete Selected
            </Button>
            <Button
              variant="outline"
              onClick={handleSendMessageSelected}
              disabled={selectedRows.length === 0 || isSending}
            >
              {isSending ? "Sending..." : "Send Message to Selected"}
            </Button>
          </div>

          {/* Responsive table container */}
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
                  <TableHead>Community Charge up to {currentYear}  End</TableHead>
                  <TableHead>Rent collected</TableHead>
                  <TableHead>Against month of</TableHead>
                  <TableHead>Leasing Commission</TableHead>
                  <TableHead>Property Management Fee</TableHead>
                  <TableHead>VAT_on_Management_Fee_and_Commission</TableHead>
                  <TableHead>Municipality Fee</TableHead>
                  <TableHead>Community</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Payable to Owner</TableHead>
                  <TableHead>Community charge Carried forward</TableHead>
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
                    <TableCell>
                      {result.Community_Charge_up_to_2024_End}
                    </TableCell>
                    <TableCell>{result.Rent_collected}</TableCell>
                    <TableCell>{result.Against_month_of}</TableCell>
                    <TableCell>{result.Leasing_Commission}</TableCell>
                    <TableCell>{result.Property_Management_Fee}</TableCell>
                    <TableCell>{result.VAT_on_Management_Fee_and_Commission}</TableCell>
                    <TableCell>{result.Municipality_Fee}</TableCell>
                    <TableCell>{result.Community}</TableCell>
                    <TableCell>{result.Maintenance}</TableCell>
                    <TableCell>{result.Payable_to_Owner}</TableCell>
                    <TableCell>
                      {result.Community_charge_Carried_forward}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      {showDialog && (
        <ConfirmationDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${rowsToDelete.length} selected item(s)?`}
        />
      )}
      <Toaster />
    </>
  );
}