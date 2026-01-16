import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ContactDetails {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  whatsapp: string;
}

export default function AdminContactManagement() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    phone: "+91 98765 43210",
    email: "support@vasstra.com",
    address: "123 Fashion Street, Textile Hub\nMumbai, Maharashtra 400001",
    businessHours: "Monday - Saturday: 10:00 AM - 7:00 PM\nSunday: Closed",
    whatsapp: "919876543210",
  });

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Fetch contact details on mount
  useEffect(() => {
    fetchContactDetails();
  }, [token]);

  const fetchContactDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/contact`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact details');
      }

      const data = await response.json();
      if (data.contact) {
        setContactDetails({
          phone: data.contact.phone || "+91 98765 43210",
          email: data.contact.email || "support@vasstra.com",
          address: data.contact.address || "123 Fashion Street, Textile Hub\nMumbai, Maharashtra 400001",
          businessHours: data.contact.businessHours || "Monday - Saturday: 10:00 AM - 7:00 PM\nSunday: Closed",
          whatsapp: data.contact.whatsapp || "919876543210",
        });
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      toast({
        title: "Error",
        description: "Failed to load contact details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactDetails, value: string) => {
    setContactDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!contactDetails.phone || !contactDetails.email || !contactDetails.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/admin/contact`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contactDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact details');
      }

      toast({
        title: "Success",
        description: "Your contact information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving contact details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save contact details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading contact details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Management</h2>
          <p className="text-muted-foreground">Update your store's contact information</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Phone Number
            </CardTitle>
            <CardDescription>Primary contact number for customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={contactDetails.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Address
            </CardTitle>
            <CardDescription>Support email for customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={contactDetails.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="support@example.com"
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Store Address
            </CardTitle>
            <CardDescription>Physical store or office location</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={contactDetails.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter your store address"
              rows={3}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Business Hours
            </CardTitle>
            <CardDescription>Store operating hours</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="hours">Hours</Label>
            <Textarea
              id="hours"
              value={contactDetails.businessHours}
              onChange={(e) => handleInputChange("businessHours", e.target.value)}
              placeholder="Enter business hours"
              rows={3}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              WhatsApp Number
            </CardTitle>
            <CardDescription>WhatsApp contact for quick responses (without + sign)</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              value={contactDetails.whatsapp}
              onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              placeholder="919876543210"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter the number with country code (e.g., 919876543210 for India)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
