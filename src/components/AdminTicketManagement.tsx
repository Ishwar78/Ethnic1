import { useState, useEffect } from "react";
import { Ticket, Send, AlertCircle, HelpCircle, Package, CreditCard, Clock, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  status: "open" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  message: string;
  responses: { message: string; isAdmin: boolean; createdAt: string }[];
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

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  medium: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  high: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function AdminTicketManagement() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isResponding, setIsResponding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Fetch tickets from API
  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/tickets/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets.map((ticket: any) => ({
          id: ticket._id,
          userId: ticket.userId?._id,
          userName: ticket.userId?.name || 'Unknown',
          userEmail: ticket.userId?.email || 'Unknown',
          subject: ticket.subject,
          category: ticket.category,
          status: ticket.status,
          priority: ticket.priority || 'medium',
          createdAt: ticket.createdAt,
          message: ticket.message,
          responses: ticket.responses || [],
        })));
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch support tickets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = filterStatus === "all" 
    ? tickets 
    : tickets.filter((t) => t.status === filterStatus);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/tickets/admin/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Status Updated",
          description: `Ticket status changed to ${newStatus}`,
        });
        fetchTickets();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !responseText.trim()) return;

    setIsResponding(true);
    try {
      const response = await fetch(`${API_URL}/tickets/admin/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: responseText }),
      });

      const data = await response.json();
      if (data.success) {
        setResponseText("");
        toast({
          title: "Response Sent",
          description: "Your response has been sent to the customer.",
        });
        fetchTickets();
        // Update selected ticket with new response
        setSelectedTicket((prev) =>
          prev && data.ticket
            ? {
                ...prev,
                status: data.ticket.status,
                responses: data.ticket.responses,
              }
            : prev
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setIsResponding(false);
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground">Manage and respond to customer support requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading tickets...</p>
            </CardContent>
          </Card>
        ) : filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tickets found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const IconComponent = categoryIcons[ticket.category] || HelpCircle;
            return (
              <Card key={ticket.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium">#{ticket.id}</span>
                          <Badge variant="outline" className={statusColors[ticket.status]}>
                            {ticket.status.replace("-", " ")}
                          </Badge>
                          <Badge variant="outline" className={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-foreground">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ticket.userName} • {ticket.userEmail}
                        </p>
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
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <Button size="sm" onClick={() => setSelectedTicket(ticket)}>
                        View & Respond
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Ticket #{selectedTicket.id}
                  <Badge variant="outline" className={statusColors[selectedTicket.status]}>
                    {selectedTicket.status.replace("-", " ")}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{selectedTicket.userName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedTicket.userEmail}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{selectedTicket.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <p className="font-medium capitalize">{selectedTicket.priority}</p>
                    </div>
                  </div>
                </div>

                {/* Subject & Message */}
                <div>
                  <h4 className="font-semibold mb-2">{selectedTicket.subject}</h4>
                  <p className="text-muted-foreground">{selectedTicket.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Conversation History */}
                {selectedTicket.responses.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3">Conversation</h5>
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
                            {response.isAdmin ? "Admin" : selectedTicket.userName} •{" "}
                            {new Date(response.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="flex items-center gap-4 border-t pt-4">
                  <span className="text-sm font-medium">Update Status:</span>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => {
                      handleStatusChange(selectedTicket.id, value);
                      setSelectedTicket((prev) =>
                        prev ? { ...prev, status: value as SupportTicket["status"] } : null
                      );
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reply */}
                <div className="border-t pt-4">
                  <h5 className="font-medium mb-2">Send Response</h5>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response to the customer..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
                <Button
                  onClick={handleSendResponse}
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
