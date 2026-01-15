import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Edit2, Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Measurement {
  name: string;
  value: string;
}

interface Size {
  label: string;
  measurements: Measurement[];
}

interface SizeChart {
  _id?: string;
  productId: string;
  sizes: Size[];
  unit: 'cm' | 'inches';
}

interface Product {
  _id: string;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SizeChartManagement() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [sizeChart, setSizeChart] = useState<SizeChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [sizes, setSizes] = useState<Size[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    sizeLabel: "",
    measurements: [{ name: "", value: "" }],
  });
  const { toast } = useToast();

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch size chart when product is selected
  useEffect(() => {
    if (selectedProductId) {
      fetchSizeChart();
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const fetchSizeChart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/size-charts/product/${selectedProductId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch size chart');
      const data = await response.json();
      
      if (data.sizeChart) {
        setSizeChart(data.sizeChart);
        setSizes(data.sizeChart.sizes || []);
        setUnit(data.sizeChart.unit || 'cm');
      } else {
        setSizeChart(null);
        setSizes([]);
        setUnit('cm');
      }
    } catch (error) {
      console.error('Error fetching size chart:', error);
      toast({
        title: "Error",
        description: "Failed to load size chart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSize = () => {
    if (!formData.sizeLabel.trim()) {
      toast({
        title: "Error",
        description: "Please enter size label",
        variant: "destructive",
      });
      return;
    }

    if (formData.measurements.some(m => !m.name.trim() || !m.value.trim())) {
      toast({
        title: "Error",
        description: "Please fill all measurement fields",
        variant: "destructive",
      });
      return;
    }

    const sizeExists = sizes.some(s => s.label === formData.sizeLabel);
    if (sizeExists && editingIndex === null) {
      toast({
        title: "Error",
        description: "This size already exists",
        variant: "destructive",
      });
      return;
    }

    if (editingIndex !== null) {
      // Update existing
      setSizes(sizes.map((s, i) =>
        i === editingIndex
          ? {
              label: formData.sizeLabel,
              measurements: formData.measurements.filter(m => m.name && m.value),
            }
          : s
      ));
      setEditingIndex(null);
      toast({
        title: "Success",
        description: "Size updated successfully",
      });
    } else {
      // Add new
      setSizes([
        ...sizes,
        {
          label: formData.sizeLabel,
          measurements: formData.measurements.filter(m => m.name && m.value),
        },
      ]);
      toast({
        title: "Success",
        description: "Size added successfully",
      });
    }

    setFormData({
      sizeLabel: "",
      measurements: [{ name: "", value: "" }],
    });
    setIsDialogOpen(false);
  };

  const handleEditSize = (index: number) => {
    const size = sizes[index];
    setFormData({
      sizeLabel: size.label,
      measurements: [...size.measurements, { name: "", value: "" }],
    });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDeleteSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleAddMeasurement = () => {
    setFormData(prev => ({
      ...prev,
      measurements: [...prev.measurements, { name: "", value: "" }],
    }));
  };

  const handleRemoveMeasurement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      measurements: prev.measurements.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Please select a product first",
        variant: "destructive",
      });
      return;
    }

    if (sizes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one size",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/size-charts/product/${selectedProductId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sizes,
          unit,
        }),
      });

      if (!response.ok) throw new Error('Failed to save size chart');

      const data = await response.json();
      setSizeChart(data.sizeChart);

      // Refetch to ensure we have latest data
      await fetchSizeChart();

      toast({
        title: "Success",
        description: "Size chart saved successfully",
      });
    } catch (error) {
      console.error('Error saving size chart:', error);
      toast({
        title: "Error",
        description: "Failed to save size chart",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChart = async () => {
    if (!confirm('Are you sure you want to delete this size chart?')) return;

    try {
      const response = await fetch(`${API_URL}/size-charts/product/${selectedProductId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete size chart');

      setSizeChart(null);
      setSizes([]);
      toast({
        title: "Success",
        description: "Size chart deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting size chart:', error);
      toast({
        title: "Error",
        description: "Failed to delete size chart",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="product-select">Select Product</Label>
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger id="product-select">
            <SelectValue placeholder="Select a product to manage its size chart" />
          </SelectTrigger>
          <SelectContent>
            {products.map(product => (
              <SelectItem key={product._id} value={product._id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProductId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Size Chart Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unit-select">Measurement Unit</Label>
                <Select value={unit} onValueChange={(value: any) => setUnit(value)}>
                  <SelectTrigger id="unit-select" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    <SelectItem value="inches">Inches</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {sizes.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Size Chart</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted border-b">
                              <th className="px-4 py-3 text-left font-semibold">Size</th>
                              {sizes[0]?.measurements && sizes[0].measurements.map((_, mIndex) => (
                                <th key={mIndex} className="px-4 py-3 text-left font-semibold">
                                  {sizes[0].measurements[mIndex].name}
                                </th>
                              ))}
                              <th className="px-4 py-3 text-left font-semibold w-24">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sizes.map((size, index) => (
                              <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-medium">{size.label}</td>
                                {size.measurements.map((measurement, mIndex) => (
                                  <td key={mIndex} className="px-4 py-3">
                                    {measurement.value} {unit}
                                  </td>
                                ))}
                                <td className="px-4 py-3">
                                  <div className="flex gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditSize(index)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteSize(index)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setFormData({
                        sizeLabel: "",
                        measurements: [{ name: "", value: "" }],
                      });
                      setEditingIndex(null);
                      setIsDialogOpen(true);
                    }}
                    className="w-full"
                    variant={sizes.length === 0 ? "default" : "outline"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {sizes.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Size Chart'
                )}
              </Button>
              {sizeChart && (
                <Button
                  onClick={handleDeleteChart}
                  variant="destructive"
                >
                  Delete Chart
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Size Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Size" : "Add New Size"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="size-label">Size Label (e.g., S, M, L, XL)</Label>
              <Input
                id="size-label"
                value={formData.sizeLabel}
                onChange={(e) => setFormData(prev => ({ ...prev, sizeLabel: e.target.value }))}
                placeholder="S"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Measurements
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddMeasurement}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </Label>

              <div className="space-y-2">
                {formData.measurements.map((measurement, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="e.g., Chest"
                      value={measurement.name}
                      onChange={(e) => {
                        const newMeasurements = [...formData.measurements];
                        newMeasurements[index].name = e.target.value;
                        setFormData(prev => ({ ...prev, measurements: newMeasurements }));
                      }}
                    />
                    <Input
                      placeholder="e.g., 36"
                      value={measurement.value}
                      onChange={(e) => {
                        const newMeasurements = [...formData.measurements];
                        newMeasurements[index].value = e.target.value;
                        setFormData(prev => ({ ...prev, measurements: newMeasurements }));
                      }}
                    />
                    {formData.measurements.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMeasurement(index)}
                        className="h-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Add measurements like Chest, Waist, Length, Sleeve, etc.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSize}
                className="flex-1"
              >
                {editingIndex !== null ? "Update Size" : "Add Size"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
