import { useEffect, useState } from "react";
import { Printer, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerZipCode: string;
  customerCountry: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    image?: string;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  companyLogo: string;
  companyName: string;
  companyGST: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZipCode: string;
  companyCountry: string;
  companyPhone: string;
  companyEmail: string;
  paymentMethod: string;
  transactionId: string;
  notes: string;
  createdAt: string;
}

interface InvoiceDisplayProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
}

export default function InvoiceDisplay({ orderId, open, onOpenChange, token }: InvoiceDisplayProps) {
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (open && orderId && token) {
      fetchInvoice();
    }
  }, [open, orderId, token]);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to get existing invoice
      const response = await fetch(`${API_URL}/invoices/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        // If invoice doesn't exist, create it
        const createResponse = await fetch(`${API_URL}/invoices/${orderId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const createData = await createResponse.json();
        if (createData.success) {
          setInvoice(createData.invoice);
        } else {
          setError('Failed to generate invoice');
        }
      } else if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInvoice(data.invoice);
        } else {
          setError('Failed to fetch invoice');
        }
      } else {
        setError('Failed to fetch invoice');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Failed to fetch invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow && invoice) {
      printWindow.document.write(generateInvoiceHTML(invoice));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    if (invoice) {
      toast({
        title: "PDF Download",
        description: "This feature will be available soon. For now, use the print function to save as PDF.",
      });
    }
  };

  const generateInvoiceHTML = (inv: Invoice) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${inv.invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            background: white;
            padding: 20px;
          }
          .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border: 1px solid #e0e0e0;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-info {
            flex: 1;
          }
          .company-logo {
            max-width: 200px;
            max-height: 80px;
            object-fit: contain;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .company-details {
            font-size: 12px;
            color: #666;
            line-height: 1.6;
          }
          .invoice-meta {
            text-align: right;
          }
          .invoice-meta-item {
            margin-bottom: 8px;
            font-size: 12px;
          }
          .invoice-meta-label {
            color: #666;
            font-weight: bold;
          }
          .invoice-meta-value {
            color: #333;
          }
          .invoice-number-large {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-top: 10px;
          }
          .invoice-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .section-content {
            font-size: 12px;
            color: #333;
            line-height: 1.8;
          }
          .section-content p {
            margin-bottom: 5px;
          }
          .invoice-items {
            margin-bottom: 40px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items-table th {
            background-color: #f5f5f5;
            border-bottom: 2px solid #333;
            padding: 10px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
            color: #333;
          }
          .items-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #ddd;
            font-size: 12px;
            color: #333;
          }
          .items-table .text-right {
            text-align: right;
          }
          .total-row {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .invoice-summary {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
          }
          .summary-table {
            width: 300px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 12px;
            border-bottom: 1px solid #ddd;
          }
          .summary-row.total {
            font-weight: bold;
            font-size: 14px;
            border-top: 2px solid #333;
            border-bottom: none;
            padding: 12px 0;
            color: #333;
          }
          .summary-label {
            color: #666;
          }
          .summary-value {
            color: #333;
            font-weight: bold;
          }
          .invoice-footer {
            border-top: 1px solid #ddd;
            padding-top: 20px;
            font-size: 11px;
            color: #666;
            text-align: center;
          }
          .notes {
            margin-top: 20px;
            font-size: 11px;
            color: #666;
            background: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .invoice-container {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="company-info">
              ${inv.companyLogo ? `<img src="${inv.companyLogo}" class="company-logo" alt="Logo">` : ''}
              <div class="company-name">${inv.companyName || 'Vasstra Fashion'}</div>
              <div class="company-details">
                ${inv.companyAddress ? `<p>${inv.companyAddress}</p>` : ''}
                ${inv.companyCity || inv.companyState ? `<p>${inv.companyCity}${inv.companyCity && inv.companyState ? ', ' : ''}${inv.companyState} ${inv.companyZipCode}</p>` : ''}
                ${inv.companyPhone ? `<p>Phone: ${inv.companyPhone}</p>` : ''}
                ${inv.companyEmail ? `<p>Email: ${inv.companyEmail}</p>` : ''}
                ${inv.companyGST ? `<p>GST: ${inv.companyGST}</p>` : ''}
              </div>
            </div>
            <div class="invoice-meta">
              <div class="invoice-meta-item">
                <span class="invoice-meta-label">Invoice Date:</span><br>
                <span class="invoice-meta-value">${new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div class="invoice-meta-item">
                <span class="invoice-meta-label">Due Date:</span><br>
                <span class="invoice-meta-value">${new Date(inv.dueDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div class="invoice-number-large">${inv.invoiceNumber}</div>
            </div>
          </div>

          <div class="invoice-content">
            <div>
              <div class="section-title">FROM</div>
              <div class="section-content">
                <p><strong>${inv.companyName || 'Vasstra Fashion'}</strong></p>
                ${inv.companyAddress ? `<p>${inv.companyAddress}</p>` : ''}
                ${inv.companyCity || inv.companyState ? `<p>${inv.companyCity}${inv.companyCity && inv.companyState ? ', ' : ''}${inv.companyState} ${inv.companyZipCode}</p>` : ''}
              </div>
            </div>
            <div>
              <div class="section-title">BILL TO</div>
              <div class="section-content">
                <p><strong>${inv.customerName}</strong></p>
                ${inv.customerAddress ? `<p>${inv.customerAddress}</p>` : ''}
                ${inv.customerCity || inv.customerState ? `<p>${inv.customerCity}${inv.customerCity && inv.customerState ? ', ' : ''}${inv.customerState} ${inv.customerZipCode}</p>` : ''}
                ${inv.customerPhone ? `<p>Phone: ${inv.customerPhone}</p>` : ''}
                ${inv.customerEmail ? `<p>Email: ${inv.customerEmail}</p>` : ''}
              </div>
            </div>
          </div>

          <div class="invoice-items">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th class="text-right">QTY</th>
                  <th class="text-right">Rate</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${inv.orderItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.size || '-'}</td>
                    <td>${item.color || '-'}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">₹${item.price.toFixed(2)}</td>
                    <td class="text-right">₹${item.subtotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="invoice-summary">
            <div class="summary-table">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">₹${inv.subtotal.toFixed(2)}</span>
              </div>
              ${inv.taxAmount > 0 ? `
                <div class="summary-row">
                  <span class="summary-label">Tax</span>
                  <span class="summary-value">₹${inv.taxAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              ${inv.shippingCost > 0 ? `
                <div class="summary-row">
                  <span class="summary-label">Shipping</span>
                  <span class="summary-value">₹${inv.shippingCost.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="summary-row total">
                <span>TOTAL</span>
                <span>₹${inv.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          ${inv.notes ? `<div class="notes"><strong>Notes:</strong> ${inv.notes}</div>` : ''}

          <div class="invoice-footer">
            <p>Thank you for your business!</p>
            <p style="margin-top: 10px; font-size: 10px;">This is a computer generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice</span>
            <button
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading invoice...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-destructive text-sm mb-4">{error}</p>
              <Button variant="outline" onClick={fetchInvoice}>
                Retry
              </Button>
            </div>
          </div>
        ) : invoice ? (
          <>
            {/* Invoice Preview */}
            <div className="bg-white p-8 rounded-lg border border-border shadow-sm">
              {/* Header */}
              <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-foreground/20">
                <div>
                  {invoice.companyLogo && (
                    <img
                      src={invoice.companyLogo}
                      alt="Logo"
                      className="max-w-[200px] max-h-[80px] object-contain mb-2"
                    />
                  )}
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {invoice.companyName || 'Vasstra Fashion'}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {invoice.companyAddress && <p>{invoice.companyAddress}</p>}
                    {(invoice.companyCity || invoice.companyState) && (
                      <p>
                        {invoice.companyCity}
                        {invoice.companyCity && invoice.companyState ? ', ' : ''}
                        {invoice.companyState} {invoice.companyZipCode}
                      </p>
                    )}
                    {invoice.companyPhone && <p>Phone: {invoice.companyPhone}</p>}
                    {invoice.companyEmail && <p>Email: {invoice.companyEmail}</p>}
                    {invoice.companyGST && <p>GST: {invoice.companyGST}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground block">Invoice Date</span>
                    <span className="text-sm font-medium">
                      {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground block">Due Date</span>
                    <span className="text-sm font-medium">
                      {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="mt-4 text-lg font-bold text-primary">
                    {invoice.invoiceNumber}
                  </div>
                </div>
              </div>

              {/* From and To */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">FROM</p>
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold">{invoice.companyName || 'Vasstra Fashion'}</p>
                    {invoice.companyAddress && <p>{invoice.companyAddress}</p>}
                    {(invoice.companyCity || invoice.companyState) && (
                      <p>
                        {invoice.companyCity}
                        {invoice.companyCity && invoice.companyState ? ', ' : ''}
                        {invoice.companyState} {invoice.companyZipCode}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">BILL TO</p>
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold">{invoice.customerName}</p>
                    {invoice.customerAddress && <p>{invoice.customerAddress}</p>}
                    {(invoice.customerCity || invoice.customerState) && (
                      <p>
                        {invoice.customerCity}
                        {invoice.customerCity && invoice.customerState ? ', ' : ''}
                        {invoice.customerState} {invoice.customerZipCode}
                      </p>
                    )}
                    {invoice.customerPhone && <p>Phone: {invoice.customerPhone}</p>}
                    {invoice.customerEmail && <p>Email: {invoice.customerEmail}</p>}
                  </div>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-semibold">Item</th>
                      <th className="text-left p-2 font-semibold w-20">Size</th>
                      <th className="text-left p-2 font-semibold w-20">Color</th>
                      <th className="text-center p-2 font-semibold w-16">QTY</th>
                      <th className="text-right p-2 font-semibold w-24">Rate</th>
                      <th className="text-right p-2 font-semibold w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.orderItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-muted">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                            )}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="text-left p-2">{item.size || '-'}</td>
                        <td className="text-left p-2">{item.color || '-'}</td>
                        <td className="text-center p-2">{item.quantity}</td>
                        <td className="text-right p-2">₹{item.price.toFixed(2)}</td>
                        <td className="text-right p-2">₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between text-sm mb-2 pb-2 border-b">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between text-sm mb-2 pb-2 border-b">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">₹{invoice.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.shippingCost > 0 && (
                    <div className="flex justify-between text-sm mb-2 pb-2 border-b">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">₹{invoice.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t-2">
                    <span>TOTAL</span>
                    <span className="text-primary">₹{invoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="bg-muted/30 p-3 rounded text-sm mb-4">
                  <p className="font-semibold text-muted-foreground">Notes:</p>
                  <p>{invoice.notes}</p>
                </div>
              )}

              <Separator className="mb-4" />

              <div className="text-center text-xs text-muted-foreground">
                <p>Thank you for your business!</p>
                <p className="mt-1">This is a computer generated invoice and does not require a signature.</p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
