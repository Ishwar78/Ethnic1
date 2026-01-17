import { useState, useEffect } from "react";
import { Send, Ticket, AlertCircle, HelpCircle, Package, CreditCard, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TicketResponse {
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
  message: string;
  responses: TicketResponse[];
}

const categoryIcons: Record<string, React.ElementType> = {
  order: Package,
  payment: CreditCard,
  general: HelpCircle,
  complaint: AlertCircle,
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "in-progress": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
};

export default function SupportTicketForm() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    orderId: "",
    message: "",
  });

  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Fetch user's tickets
  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/tickets/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.category || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Ticket Created",
          description: `Your support ticket has been submitted.`,
        });
        setFormData({ subject: "", category: "", orderId: "", message: "" });
        fetchTickets();
        // Auto-select and show the newly created ticket
        if (data.ticket) {
          setSelectedTicket(data.ticket);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create ticket",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddResponse = async () => {
    if (!selectedTicket || !responseText.trim()) return;

    setIsResponding(true);
    try {
      const response = await fetch(`${API_URL}/tickets/${selectedTicket._id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: responseText }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedTicket(data.ticket);
        setResponseText("");
        fetchTickets();
        toast({
          title: "Success",
          description: "Your response has been added.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive",
      });
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Ticket Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Create Support Ticket
          </CardTitle>
          <CardDescription>
            Having an issue? Submit a ticket and we'll help you out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Order Issue</SelectItem>
                    <SelectItem value="payment">Payment Issue</SelectItem>
                    <SelectItem value="general">General Query</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID (if applicable)</Label>
                <Input
                  id="orderId"
                  value={formData.orderId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orderId: e.target.value }))}
                  placeholder="VAS12345678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your issue in detail..."
                rows={4}
              />
            </div>

            <Button type="submit" variant="gold" disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Your Tickets */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Tickets</h3>
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading tickets...</p>
            </CardContent>
          </Card>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No support tickets yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const IconComponent = categoryIcons[ticket.category] || HelpCircle;
              return (
                <Card key={ticket._id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">#{ticket._id?.slice(-6).toUpperCase()}</span>
                            <Badge variant="outline" className={statusColors[ticket.status]}>
                              {ticket.status.replace("-", " ")}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-foreground">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {ticket.message}
                          </p>
                          {ticket.responses.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {ticket.responses.length} response(s)
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Ticket #{selectedTicket._id?.slice(-6).toUpperCase()}
                  <Badge variant="outline" className={statusColors[selectedTicket.status]}>
                    {selectedTicket.status.replace("-", " ")}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Ticket Info */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Subject</p>
                      <p className="font-medium">{selectedTicket.subject}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{selectedTicket.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Message</p>
                      <p className="font-medium">{selectedTicket.message}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conversation */}
                {selectedTicket.responses.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3">Responses</h5>
                    <div className="space-y-3">
                      {selectedTicket.responses.map((response, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            response.isAdmin
                              ? "bg-primary/10 ml-8"
                              : "bg-muted/30 mr-8"
                          }`}
                        >
                          <p className="text-sm">{response.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {response.isAdmin ? "Admin Support" : "You"} • {new Date(response.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Response */}
                <div className="border-t pt-4">
                  <h5 className="font-medium mb-2">Add a Response</h5>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
                <Button
                  onClick={handleAddResponse}
                  disabled={!responseText.trim() || isResponding}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isResponding ? "Sending..." : "Send Response"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
