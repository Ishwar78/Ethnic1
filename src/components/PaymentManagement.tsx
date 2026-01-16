import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Upload, X, Plus } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface PaymentCodeSettings {
  name: 'phonepe' | 'paytm' | 'googlepay' | 'amazon_pay' | 'other';
  address: string;
  qrCode?: string;
  isActive: boolean;
}

interface PaymentSettings {
  upiEnabled: boolean;
  upiAddress: string;
  upiQrCode: string;
  upiName: string;
  codEnabled: boolean;
  codePaymentEnabled: boolean;
  paymentCodes: PaymentCodeSettings[];
}

const PaymentCodeNames = {
  phonepe: 'PhonePe',
  paytm: 'Paytm',
  googlepay: 'Google Pay',
  amazon_pay: 'Amazon Pay',
  other: 'Other'
};

export default function PaymentManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    upiEnabled: true,
    upiAddress: '',
    upiQrCode: '',
    upiName: 'Vasstra Payments',
    codEnabled: true,
    codePaymentEnabled: true,
    paymentCodes: []
  });

  const [newPaymentCode, setNewPaymentCode] = useState<PaymentCodeSettings>({
    name: 'phonepe',
    address: '',
    qrCode: '',
    isActive: true
  });

  useEffect(() => {
    fetchPaymentSettings();
  }, [token]);

  const fetchPaymentSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/payment-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPaymentSettings(data.paymentSettings);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpiQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await handleFileUpload(file);
        setPaymentSettings(prev => ({
          ...prev,
          upiQrCode: base64
        }));
        toast({
          title: 'Success',
          description: 'UPI QR code uploaded',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to upload QR code',
          variant: 'destructive',
        });
      }
    }
  };

  const handlePaymentCodeQrUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await handleFileUpload(file);
        setPaymentSettings(prev => {
          const newCodes = [...prev.paymentCodes];
          newCodes[index].qrCode = base64;
          return { ...prev, paymentCodes: newCodes };
        });
        toast({
          title: 'Success',
          description: 'QR code uploaded',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to upload QR code',
          variant: 'destructive',
        });
      }
    }
  };

  const handleAddPaymentCode = () => {
    if (!newPaymentCode.address.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter payment address/ID',
        variant: 'destructive',
      });
      return;
    }

    setPaymentSettings(prev => ({
      ...prev,
      paymentCodes: [...prev.paymentCodes, newPaymentCode]
    }));

    setNewPaymentCode({
      name: 'phonepe',
      address: '',
      qrCode: '',
      isActive: true
    });

    toast({
      title: 'Success',
      description: 'Payment code added',
    });
  };

  const handleRemovePaymentCode = (index: number) => {
    setPaymentSettings(prev => ({
      ...prev,
      paymentCodes: prev.paymentCodes.filter((_, i) => i !== index)
    }));
    toast({
      title: 'Success',
      description: 'Payment code removed',
    });
  };

  const handleTogglePaymentCode = (index: number) => {
    setPaymentSettings(prev => {
      const newCodes = [...prev.paymentCodes];
      newCodes[index].isActive = !newCodes[index].isActive;
      return { ...prev, paymentCodes: newCodes };
    });
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/admin/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentSettings),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Payment settings updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update payment settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save payment settings',
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* UPI Payment Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>UPI Payment Settings</CardTitle>
              <CardDescription>Configure UPI payment options for customers</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="upi-toggle" className="text-sm">Enable UPI</Label>
              <Switch
                id="upi-toggle"
                checked={paymentSettings.upiEnabled}
                onCheckedChange={(checked) =>
                  setPaymentSettings(prev => ({ ...prev, upiEnabled: checked }))
                }
              />
            </div>
          </div>
        </CardHeader>

        {paymentSettings.upiEnabled && (
          <CardContent className="space-y-6">
            {/* UPI Name */}
            <div className="space-y-2">
              <Label htmlFor="upi-name">UPI Account Name</Label>
              <Input
                id="upi-name"
                placeholder="e.g., Vasstra Payments"
                value={paymentSettings.upiName}
                onChange={(e) =>
                  setPaymentSettings(prev => ({ ...prev, upiName: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">Name to display for UPI payments</p>
            </div>

            {/* UPI Address */}
            <div className="space-y-2">
              <Label htmlFor="upi-address">UPI ID / Address</Label>
              <Input
                id="upi-address"
                placeholder="e.g., vasstra@upi or 9876543210@okhdfcbank"
                value={paymentSettings.upiAddress}
                onChange={(e) =>
                  setPaymentSettings(prev => ({ ...prev, upiAddress: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">UPI address for payments (e.g., yourname@upi)</p>
            </div>

            {/* UPI QR Code */}
            <div className="space-y-3">
              <Label>UPI QR Code</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpiQrUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {paymentSettings.upiQrCode ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-600">✓ QR Code Uploaded</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">Upload QR Code</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {paymentSettings.upiQrCode && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={paymentSettings.upiQrCode}
                      alt="UPI QR Code Preview"
                      className="w-32 h-32 border-2 border-border rounded-lg object-cover bg-white p-2"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setPaymentSettings(prev => ({ ...prev, upiQrCode: '' }))
                      }
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Alternative Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alternative Payment Methods</CardTitle>
              <CardDescription>Add PhonePe, Paytm, Google Pay, and other payment options</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="code-toggle" className="text-sm">Enable</Label>
              <Switch
                id="code-toggle"
                checked={paymentSettings.codePaymentEnabled}
                onCheckedChange={(checked) =>
                  setPaymentSettings(prev => ({ ...prev, codePaymentEnabled: checked }))
                }
              />
            </div>
          </div>
        </CardHeader>

        {paymentSettings.codePaymentEnabled && (
          <CardContent className="space-y-6">
            {/* Add New Payment Code */}
            <div className="border-2 border-dashed rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Add New Payment Method</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <select
                    id="payment-method"
                    value={newPaymentCode.name}
                    onChange={(e) =>
                      setNewPaymentCode(prev => ({
                        ...prev,
                        name: e.target.value as PaymentCodeSettings['name']
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    {Object.entries(PaymentCodeNames).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-address">Payment ID / Address</Label>
                  <Input
                    id="payment-address"
                    placeholder="e.g., yourname@phonepe or 9876543210"
                    value={newPaymentCode.address}
                    onChange={(e) =>
                      setNewPaymentCode(prev => ({ ...prev, address: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>QR Code (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file).then(base64 => {
                          setNewPaymentCode(prev => ({ ...prev, qrCode: base64 }));
                        });
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {newPaymentCode.qrCode ? (
                    <p className="text-sm font-medium text-green-600">✓ QR Code Selected</p>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Click to upload QR</p>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleAddPaymentCode} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {/* Existing Payment Codes */}
            {paymentSettings.paymentCodes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Active Payment Methods</h3>
                {paymentSettings.paymentCodes.map((code, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {PaymentCodeNames[code.name]}
                        </h4>
                        <p className="text-sm text-muted-foreground font-mono">{code.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={code.isActive}
                          onCheckedChange={() => handleTogglePaymentCode(index)}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemovePaymentCode(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {code.qrCode && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">QR Code: ✓ Uploaded</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handlePaymentCodeQrUpload(index, e as any);
                            input.click();
                          }}
                        >
                          Update QR
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Cash on Delivery */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cash on Delivery (COD)</CardTitle>
              <CardDescription>Customers will pay when they receive their order</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="cod-toggle" className="text-sm">Enable COD</Label>
              <Switch
                id="cod-toggle"
                checked={paymentSettings.codEnabled}
                onCheckedChange={(checked) =>
                  setPaymentSettings(prev => ({ ...prev, codEnabled: checked }))
                }
              />
            </div>
          </div>
        </CardHeader>
        {paymentSettings.codEnabled && (
          <CardContent>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-600">
                ✓ COD payment option is enabled for customers.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Payment Settings'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={fetchPaymentSettings}
          disabled={isSaving}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
