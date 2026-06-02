import Loader from "../components/Loader"
import HeadTypography from "../components/HeadTypography";
import { useEffect, useState } from "react";
import CustomTable from "../components/CustomTable";
import { useQuotesState } from "../stores";
import QuoteById from "../components/QuoteById";
import { getAllQuotes, createQuote, updateQuote } from "../config";

const Quotes = () => {
  const { quotes, setQuotes } = useQuotesState((state:any) => state);
  const [openQuoteDialog, setOpenQuoteDialog] = useState(false);
  const [editingQuote, setEditingQuote] = useState<iQuote | null>(null);
  const [openLoader, setOpenLoader] = useState(false);

  const buttons = [
    {
      label: <span>Add Quote</span>,
      onClick: () => {
        setEditingQuote(null);
        setOpenQuoteDialog(true);
      },
    },
  ];

  const columns = [
    {
      id: "index",
      label: "#",
      render: (_row: iQuote, index: number) => {
        return index + 1;
      },
    },
    {
      id: "name",
      label: "Name",
      render: (_row: iQuote) => {
        return _row.name;
      },
    },
    {
      id: "productName",
      label: "Product Name",
      render: (_row: iQuote) => {
        return _row.productName;
      },
    },
    {
      id: "tierName",
      label: "Tier",
      render: (_row: iQuote) => {
        return _row.tierName;
      },
    },
    {
      id: "netTotal",
      label: "Net Total",
      render: (_row: iQuote) => {
        return `$${_row.financials.netTotal.toFixed(2)}`;
      },
    },
    {
      id: "actions",
      label: "Actions",
      render: (_row: iQuote) => {
        return (
          <>
            <button
              onClick={() => {
                const url = `${window.location.origin}/quote/${_row._id}`;
                copyToClipboard(url);
              }}
              className="text-blue-500 hover:underline"
            >
              Copy URL
            </button>
          </>
        );
      },
    },
  ];

  const fetchAllQuotes = async () => {
    try {
      setOpenLoader(true);
      const { data } = await getAllQuotes();
      const { success, quotes } = data as {
        success: boolean;
        quotes: iQuote[];
      };

      if (success) {
        setQuotes(quotes);
      }
    } catch (err) {
      console.error("Error fetching quotes:", err);
    } finally {
      setOpenLoader(false);
    }
  };

  const handleQuoteSubmit = async (data: iQuote) => {
    try {
      setOpenLoader(true);
      if (data._id && editingQuote?._id) {
        await updateQuote(data._id, data);
      } else {
        const { _id, shareToken, ...createData } = data;
        await createQuote(createData as any);
      }
      fetchAllQuotes();
    } catch (error) {
      console.error("Error submitting Quote:", error);
    } finally {
      setOpenLoader(false);
      setOpenQuoteDialog(false);
      setEditingQuote(null);
    }
  };

  /**
   * Copies a given string of text to the user's clipboard.
   * @param text - The string to be copied.
   * @returns A promise that resolves to true if successful, or false if it fails.
   */
  async function copyToClipboard(text: string): Promise<boolean> {
    // Modern Clipboard API approach
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error("Modern clipboard copy failed:", error);
        // Fallback to legacy method if modern fails for some reason
      }
    }

    // Legacy fallback approach for older browsers / non-HTTPS
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom of the page in some browsers
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Url Copied to Clipboard!");
      return successful;
    } catch (error) {
      console.error("Fallback clipboard copy failed:", error);
      document.body.removeChild(textArea);
      return false;
    }
  }

  useEffect(() => {
    fetchAllQuotes();
  }, []);

  return (
    <div>
      <Loader open={openLoader} />
      <HeadTypography title="QUOTES" buttons={buttons} />
      <CustomTable
        columns={columns}
        data={quotes || []}
        rowKey="_id"
        emptyMessage="No quotes found"
        stickyHeader
      />
      <QuoteById
        open={openQuoteDialog}
        onClose={() => setOpenQuoteDialog(false)}
        onSubmit={handleQuoteSubmit}
        quote={editingQuote}
      />
    </div>
  )
}

export default Quotes
