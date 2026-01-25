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
import ConfirmationDialog from "@/app/pages/components/ConfirmationDialog";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(true);
      try {
        const res = await fetch("/api/get_sheet_rent_receivables");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result: SheetData[] = await res.json();
        setData(result);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  // Process queue automatically only when items are added to it via button
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (queue.length > 0 && !isSending) {
      intervalId = setInterval(() => {
        sendBatch();
      }, 2000); // Process batch every 2 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    }
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
        duration: 3000,
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
        variant: "destructive",
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
    setQueue((prev) => [...prev, ...selectedData.map((item) => item.Contact)]);
    setSelectedRows([]);
    toast({
      description: "Messages added to the queue for sending.",
      duration: 3000,
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

      // If no matching data found for queue items (rare edge case), just slice queue
      if (batchData.length === 0 && batch.length > 0) {
        setQueue((prev) => prev.slice(batchSize));
        return;
      }

      if (batchData.length === 0) return;

      setIsSending(true);

      const res = await fetch("/api/generate_send_rent_receivables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedRows: batchData }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to send messages: ${res.status}`);
      }

      toast({
        description: `${batchData.length} messages sent successfully.`,
        duration: 3000,
        style: {
          background: "#27ae60",
          color: "#FFFFFF",
        },
      });

      setQueue((prevQueue) => prevQueue.slice(batchSize));
      setData((prevData) =>
        prevData.filter((item) => !batch.includes(item.Contact))
      );

      // Simple progress tracking
      setProgress(100);

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
    } catch (error: any) {
      console.error("Error sending messages:", error);
      toast({
        title: "Error sending messages",
        description: error.message,
        variant: "destructive",
      });
      // Safety: clear queue on error to prevent infinite loops
      setQueue([]);
    } finally {
      setIsSending(false);
    }
  };

  const formatCurrency = (val: string | number) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-AE', { style: 'decimal', minimumFractionDigits: 2 }).format(num);
  }

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
          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
              Error: {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Sending Progress */}
              {isSending && (
                <div className="my-6 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sending messages...</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  disabled={selectedRows.length === 0}
                >
                  Delete Selected ({selectedRows.length})
                </Button>
                <Button
                  variant={isSending ? "secondary" : "default"}
                  onClick={handleSendMessageSelected}
                  disabled={selectedRows.length === 0 || isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message to Selected"
                  )}
                </Button>
              </div>

              {/* Table */}
              <div className="rounded-md border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="min-w-full table-auto">
                    <TableCaption>A list of your recent invoices.</TableCaption>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            checked={selectAll}
                            onChange={handleSelectAllRows}
                          />
                        </TableHead>
                        <TableHead className="w-[100px]">BUT ID</TableHead>
                        <TableHead>Tenant Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Lease Start</TableHead>
                        <TableHead>Lease End</TableHead>
                        <TableHead>Rent Start</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Against Month</TableHead>
                        <TableHead>Rent Amount</TableHead>
                        <TableHead>Months</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={13} className="h-24 text-center text-muted-foreground">
                            No records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((item) => (
                          <TableRow key={item.BUT_ID} className="hover:bg-gray-50">
                            <TableCell>
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
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
                            <TableCell>{formatCurrency(item.Rent_Amount)}</TableCell>
                            <TableCell>{item.Number_of_Months}</TableCell>
                            <TableCell>{formatCurrency(item.Amount)}</TableCell>
                            <TableCell className="font-bold text-green-600">{formatCurrency(item.Total_Amount)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

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