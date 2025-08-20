"use client";
import { useState, useEffect, useRef } from "react";
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
import { Toaster } from "@/components/ui/toaster";

type SheetData = {
  BUT_ID: string;
  Tenant_Name: string;
  Contact: string;
  Lease_Start_Date: string;
  Lease_End_Date: string;
  Rent_start_month: string;
  Remarks: string;
  Against_month_of: string;
  Rent_Amount: number;
  Number_of_Months: string;
  Amount: number;
  Total_Amount: number;
};

export default function Home() {
  const [data, setData] = useState<SheetData[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [rowsToDelete, setRowsToDelete] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const batchSize = 10;
  const [progress, setProgress] = useState(0);

  // Fetch data from API on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/get_sheet_rent_receivables");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result: SheetData[] = await res.json();
        setData(result);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
      }
    }
    fetchData();
  }, []);

  // Automatically send messages in intervals if queue has items and not currently sending
  useEffect(() => {
    if (queue.length === 0 || isSending) return;
    const intervalId = setInterval(() => {
      sendBatch();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [queue, isSending]);

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
    if (selectedRows.length === 0) return;
    setRowsToDelete(selectedRows);
    setShowDialog(true);
  };

  // Confirm deletion of selected rows
  const confirmDelete = async () => {
    try {
      const res = await fetch("/api/delete_records_rent_receivable", {
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
      setRowsToDelete([]); // Reset rowsToDelete after deletion
      setShowDialog(false); // Close the dialog

      toast({
        description: `${rowsToDelete.length} item(s) deleted successfully.`,
        duration: 5000,
        style: {
          background: "#27ae60",
          color: "#FFFFFF",
          border: "1px solid #27ae60",
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
      setRowsToDelete([]); // Reset rowsToDelete to clear the selection
      setShowDialog(false); // Ensure dialog closes
    }
  };

  // Close dialog without deleting
  const handleCloseDialog = () => {
    setShowDialog(false);
    setRowsToDelete([]); // Clear rowsToDelete when closing dialog
  };

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
      const batch = queue.slice(0, batchSize);
      const batchData = data.filter((item) => batch.includes(item.Contact));
      if (batchData.length === 0) return;

      setIsSending(true);

      const res = await fetch("/api/generate_send_rent_receivables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedRows: batchData }),
      });

      if (!res.ok) throw new Error(`Failed to send messages: ${res.status}`);

      toast({
        description: `${batchData.length} messages sent successfully.`,
        duration: 5000,
        style: {
          background: "#27ae60",
          color: "#FFFFFF",
        },
      });

      setQueue((prevQueue) => prevQueue.slice(batchSize));
      setData((prevData) =>
        prevData.filter((item) => !batch.includes(item.Contact))
      );

      setProgress(
        (prevProgress) => prevProgress + (batchData.length / data.length) * 100
      );

      if (queue.length <= batchSize) {
        setProgress(100);
        toast({
          description: "All messages sent successfully!",
          duration: 5000,
          style: {
            background: "#27ae60",
            color: "#FFFFFF",
          },
        });
        setTimeout(() => setProgress(0), 2000);
      }
    } catch (error) {
      console.error("Error sending messages:", error);
      toast({
        description: "Error sending messages.",
        duration: 5000,
        style: { background: "#c0392b", color: "#FFFFFF" },
      });
    } finally {
      setIsSending(false);
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
          <div className="overflow-x-auto">
            <Table className="min-w-full table-auto">
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllRows}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">BUT ID</TableHead>
                  <TableHead>Tenant Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Lease Start Date</TableHead>
                  <TableHead>Lease End Date</TableHead>
                  <TableHead>Rent Start Month</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Against Month Of</TableHead>
                  <TableHead>Rent Amount</TableHead>
                  <TableHead>Number of Months</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.BUT_ID}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.Contact)}
                        onChange={() => handleSelectRow(item.Contact)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.BUT_ID}</TableCell>
                    <TableCell>{item.Tenant_Name}</TableCell>
                    <TableCell>{item.Contact}</TableCell>
                    <TableCell>{item.Lease_Start_Date}</TableCell>
                    <TableCell>{item.Lease_End_Date}</TableCell>
                    <TableCell>{item.Rent_start_month}</TableCell>
                    <TableCell>{item.Remarks}</TableCell>
                    <TableCell>{item.Against_month_of}</TableCell>
                    <TableCell>{item.Rent_Amount}</TableCell>
                    <TableCell>{item.Number_of_Months}</TableCell>
                    <TableCell>{item.Amount}</TableCell>
                    <TableCell>{item.Total_Amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Confirmation Dialog */}
          {showDialog && (
            <ConfirmationDialog
              isOpen={showDialog}
              onClose={handleCloseDialog} // Updated to handleCloseDialog
              onConfirm={confirmDelete}
              title="Confirm Deletion"
              message={`Are you sure you want to delete ${rowsToDelete.length} selected item(s)?`}
            />
          )}
        </main>
      </div>
      <Toaster />
    </>
  );
}