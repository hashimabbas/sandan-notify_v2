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
  _id?: string;
  CR_Note: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [rowsToDelete, setRowsToDelete] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState(4);
  const [progress, setProgress] = useState(0);
  const currentYear = new Date().getFullYear();

  // Fetch data from API on component mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
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
        variant: "destructive",
      });
    } finally {
      setShowDialog(false);
    }
  };

  // Periodically send messages from the queue
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (queue.length > 0 && !isSending) {
      intervalId = setInterval(() => {
        sendBatch();
      }, 10000);
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
      // Get the current batch from the queue
      const batch = queue.slice(0, batchSize);
      const batchData = data.filter((item) => batch.includes(item.Contact));

      console.log("Current Batch:", batch);
      console.log("Batch Data:", batchData);

      if (batchData.length > 0) {
        setIsSending(true);

        const res = await fetch("/api/generate_and_send_pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedRows: batchData }),
        });

        const result = await res.json(); // Wait for JSON response

        if (!res.ok) throw new Error(result.message || `Failed to send messages: ${res.status}`);

        // Show toast notification for successful batch sending
        toast({
          description: `${batchData.length} messages sent successfully.`,
          duration: 3000,
          style: {
            background: "#27ae60",
            color: "#FFFFFF",
          },
        });

        // Remove sent contacts from the queue
        setQueue((prevQueue) => prevQueue.slice(batchSize));

        // Remove sent contacts from data and update the UI
        setData((prevData) =>
          prevData.filter((item) => !batch.includes(item.Contact))
        );

        // Update progress
        setProgress((prevProgress) => {
          return 100; // Simplified progress
        });

        // If queue is empty
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
          setTimeout(() => {
            setProgress(0);
            setQueue([]);
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error("Error sending messages:", error);
      toast({
        title: "Error Sending Messages",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
      // Important: If we fail, we probably should stop or skip. 
      // For now, let's just clear the queue to prevent infinite loop of failures or define better retry logic.
      // But typically, clearing queue is safer to stop spamming errors.
      setQueue([]);
      setIsSending(false);
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
              {/* Process Queue Progress */}
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
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={selectedRows.length === 0}
                  >
                    Delete Selected ({selectedRows.length})
                  </Button>
                </div>

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

              {/* Responsive table container */}
              <div className="rounded-md border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>A list of your recent records.</TableCaption>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            aria-label="Select all"
                            checked={selectAll}
                            onChange={handleSelectAllRows}
                          />
                        </TableHead>
                        <TableHead>CR Note</TableHead>
                        <TableHead className="w-[100px]">Unit</TableHead>
                        <TableHead>Owner Name</TableHead>
                        <TableHead>Owner ID</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="whitespace-nowrap">Charges up to {currentYear}</TableHead>
                        <TableHead>Rent Collected</TableHead>
                        <TableHead>Against Month</TableHead>
                        <TableHead>Leasing Comm.</TableHead>
                        <TableHead>Mgmt Fee</TableHead>
                        <TableHead>VAT (Mgmt+Comm)</TableHead>
                        <TableHead>Municipality Fee</TableHead>
                        <TableHead>Community</TableHead>
                        <TableHead>Maintenance</TableHead>
                        <TableHead>Payable to Owner</TableHead>
                        <TableHead>Charges Carried Fwd</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={17} className="h-24 text-center text-muted-foreground">
                            No records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((result, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell>
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                aria-label={`Select row for contact ${result.Contact}`}
                                checked={selectedRows.includes(result.Contact)}
                                onChange={() => handleSelectRow(result.Contact)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{result.CR_Note}</TableCell>
                            <TableCell>{result.Unit}</TableCell>
                            <TableCell>{result.Name_of_Owner}</TableCell>
                            <TableCell>{result.Owner_ID_No}</TableCell>
                            <TableCell>{result.Contact}</TableCell>
                            <TableCell>{formatCurrency(result.Community_Charge_up_to_2024_End)}</TableCell>
                            <TableCell>{formatCurrency(result.Rent_collected)}</TableCell>
                            <TableCell>{result.Against_month_of}</TableCell>
                            <TableCell>{formatCurrency(result.Leasing_Commission)}</TableCell>
                            <TableCell>{formatCurrency(result.Property_Management_Fee)}</TableCell>
                            <TableCell>{formatCurrency(result.VAT_on_Management_Fee_and_Commission)}</TableCell>
                            <TableCell>{formatCurrency(result.Municipality_Fee)}</TableCell>
                            <TableCell>{result.Community}</TableCell>
                            <TableCell>{formatCurrency(result.Maintenance)}</TableCell>
                            <TableCell className="font-bold text-green-600">{formatCurrency(result.Payable_to_Owner)}</TableCell>
                            <TableCell>
                              {formatCurrency(result.Community_charge_Carried_forward)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Confirmation Dialog */}
      {showDialog && (
        <ConfirmationDialog
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