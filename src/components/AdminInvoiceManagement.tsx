import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Upload, Loader2 } from "lucide-react";

interface InvoiceSettings {
  invoiceCompanyLogo: string;
  invoiceCompanyName: string;
  invoiceCompanyGST: string;
  invoiceCompanyAddress: string;
  invoiceCompanyCity: string;
  invoiceCompanyState: string;
  invoiceCompanyZipCode: string;
  invoiceCompanyCountry: string;
  invoiceCompanyPhone: string;
  invoiceCompanyEmail: string;
}

export default function AdminInvoiceManagement() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [settings, setSettings] = useState<InvoiceSettings>({
    invoiceCompanyLogo: "",
    invoiceCompanyName: "Vasstra Fashion",
    invoiceCompanyGST: "",
    invoiceCompanyAddress: "",
    invoiceCompanyCity: "",
    invoiceCompanyState: "",
    invoiceCompanyZipCode: "",
    invoiceCompanyCountry: "India",
    invoiceCompanyPhone: "",
    invoiceCompanyEmail: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/payment-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.paymentSettings) {
        const ps = data.paymentSettings;
        setSettings({
          invoiceCompanyLogo: ps.invoiceCompanyLogo || "",
          invoiceCompanyName: ps.invoiceCompanyName || "Vasstra Fashion",
          invoiceCompanyGST: ps.invoiceCompanyGST || "",
          invoiceCompanyAddress: ps.invoiceCompanyAddress || "",
          invoiceCompanyCity: ps.invoiceCompanyCity || "",
          invoiceCompanyState: ps.invoiceCompanyState || "",
          invoiceCompanyZipCode: ps.invoiceCompanyZipCode || "",
          invoiceCompanyCountry: ps.invoiceCompanyCountry || "India",
          invoiceCompanyPhone: ps.invoiceCompanyPhone || "",
          invoiceCompanyEmail: ps.invoiceCompanyEmail || "",
        });
        if (ps.invoiceCompanyLogo) {
          setLogoPreview(ps.invoiceCompanyLogo);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch invoice settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Logo file must be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setLogoPreview(base64String);
      setSettings({ ...settings, invoiceCompanyLogo: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(`${API_URL}/admin/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Invoice settings updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save invoice settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading invoice settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>
            Configure the company details that appear on invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-3">
            <Label className="text-foreground font-semibold">Company Logo</Label>
            <p className="text-sm text-muted-foreground">
              Upload your company logo (JPG, PNG, max 2MB). This will appear at the top of invoices.
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {logoPreview ? (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-[200px] max-h-[100px] object-contain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Logo
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    Select Image
                  </Button>
                </div>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Company Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="invoiceCompanyName">Company Name *</Label>
              <Input
                id="invoiceCompanyName"
                name="invoiceCompanyName"
                value={settings.invoiceCompanyName}
                onChange={handleInputChange}
                placeholder="e.g., Vasstra Fashion"
              />
            </div>

            {/* GST Number */}
            <div className="space-y-2">
              <Label htmlFor="invoiceCompanyGST">GST Number</Label>
              <Input
                id="invoiceCompanyGST"
                name="invoiceCompanyGST"
                value={settings.invoiceCompanyGST}
                onChange={handleInputChange}
                placeholder="e.g., 27AABCA1234B1Z5"
              />
            </div>

            {/* Company Phone */}
            <div className="space-y-2">
              <Label htmlFor="invoiceCompanyPhone">Phone Number</Label>
              <Input
                id="invoiceCompanyPhone"
                name="invoiceCompanyPhone"
                value={settings.invoiceCompanyPhone}
                onChange={handleInputChange}
                placeholder="e.g., +91-9876543210"
              />
            </div>

            {/* Company Email */}
            <div className="space-y-2">
              <Label htmlFor="invoiceCompanyEmail">Email Address</Label>
              <Input
                id="invoiceCompanyEmail"
                name="invoiceCompanyEmail"
                type="email"
                value={settings.invoiceCompanyEmail}
                onChange={handleInputChange}
                placeholder="e.g., support@vasstra.com"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="invoiceCompanyAddress">Street Address</Label>
            <Textarea
              id="invoiceCompanyAddress"
              name="invoiceCompanyAddress"
              value={settings.invoiceCompanyAddress}
              onChange={handleInputChange}
              placeholder="e.g., 123 Fashion Street, Textile Hub"
              rows={3}
            />
          </div>

          {/* City, State, Zip, Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceCompanyCity">City</Label>
              <Input
                id="invoiceCompanyCity"
                name="invoiceCompanyCity"
                value={settings.invoiceCompanyCity}
                onChange={handleInputChange}
                placeholder="e.g., Mumbai"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceCompanyState">State</Label>
              <Input
                id="invoiceCompanyState"
                name="invoiceCompanyState"
                value={settings.invoiceCompanyState}
                onChange={handleInputChange}
                placeholder="e.g., Maharashtra"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceCompanyZipCode">ZIP/Postal Code</Label>
              <Input
                id="invoiceCompanyZipCode"
                name="invoiceCompanyZipCode"
                value={settings.invoiceCompanyZipCode}
                onChange={handleInputChange}
                placeholder="e.g., 400001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceCompanyCountry">Country</Label>
              <Input
                id="invoiceCompanyCountry"
                name="invoiceCompanyCountry"
                value={settings.invoiceCompanyCountry}
                onChange={handleInputChange}
                placeholder="e.g., India"
              />
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Invoice Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>
            This is how your invoice header will appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="flex items-start gap-6">
              {logoPreview && (
                <div className="flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Company logo"
                    className="max-w-[150px] max-h-[80px] object-contain"
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {settings.invoiceCompanyName || "Company Name"}
                </h2>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  {settings.invoiceCompanyAddress && <p>{settings.invoiceCompanyAddress}</p>}
                  {(settings.invoiceCompanyCity || settings.invoiceCompanyState) && (
                    <p>
                      {settings.invoiceCompanyCity}
                      {settings.invoiceCompanyCity && settings.invoiceCompanyState ? ", " : ""}
                      {settings.invoiceCompanyState} {settings.invoiceCompanyZipCode}
                    </p>
                  )}
                  {settings.invoiceCompanyPhone && <p>Phone: {settings.invoiceCompanyPhone}</p>}
                  {settings.invoiceCompanyEmail && <p>Email: {settings.invoiceCompanyEmail}</p>}
                  {settings.invoiceCompanyGST && <p>GST: {settings.invoiceCompanyGST}</p>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
