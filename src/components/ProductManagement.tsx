import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, Edit2, Trash2, Package, Loader2, Upload, X } from "lucide-react";

const subcategories = {
  ethnic_wear: ["Kurta Sets", "Anarkali Suits", "Lehengas", "Party Wear", "Festive Collection"],
  western_wear: ["Tops & Tees", "Dresses", "Co-ord Sets", "Casual Wear"]
};

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  subcategory?: string;
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  isSummer?: boolean;
  isWinter?: boolean;
  stock?: number;
  isActive?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ProductManagement() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "ethnic_wear",
    subcategory: "",
    sizes: "",
    colors: "",
    isNew: false,
    isBestseller: false,
    isSummer: false,
    isWinter: false,
    description: "",
    image: "",
    images: [] as string[],
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["all", "ethnic_wear", "western_wear"];
  const categoryLabels: { [key: string]: string } = {
    "ethnic_wear": "Ethnic Wear",
    "western_wear": "Western Wear",
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/products/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      category: product.category,
      subcategory: product.subcategory || "",
      sizes: (product.sizes || []).join(", "),
      colors: (product.colors || []).join(", "),
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
      isSummer: product.isSummer || false,
      isWinter: product.isWinter || false,
      description: "",
      image: product.image,
      images: [],
    });
    setImagePreview(product.image);
    setImagePreviews([]);
    setIsAddMode(false);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      category: "ethnic_wear",
      subcategory: "",
      sizes: "S, M, L, XL",
      colors: "",
      isNew: true,
      isBestseller: false,
      isSummer: false,
      isWinter: false,
      description: "",
      image: "",
      images: [],
    });
    setImagePreview("");
    setImagePreviews([]);
    setIsAddMode(true);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const maxImages = 6;
      const newImages: string[] = [];
      let loadedCount = 0;

      Array.from(files).slice(0, maxImages).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          newImages.push(result);
          loadedCount++;

          if (loadedCount === Array.from(files).slice(0, maxImages).length) {
            setImagePreviews([...imagePreviews, ...newImages].slice(0, maxImages));
            setFormData({
              ...formData,
              images: [...imagePreviews, ...newImages].slice(0, maxImages),
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
    setFormData({
      ...formData,
      images: updatedPreviews,
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.image) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including product image",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const sizes = formData.sizes
        .split(",")
        .map(s => s.trim().toUpperCase())
        .filter(s => s);
      const colors = formData.colors
        .split(",")
        .map(c => c.trim())
        .filter(c => c);

      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        category: formData.category,
        image: formData.image,
        images: formData.images.length > 0 ? formData.images : [formData.image],
        sizes,
        colors,
        description: formData.description || formData.name,
        isNew: formData.isNew || false,
        isBestseller: formData.isBestseller || false,
        isSummer: formData.isSummer || false,
        isWinter: formData.isWinter || false,
      };

      if (isAddMode) {
        const response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create product');
        }

        toast({
          title: "Success",
          description: `${formData.name} has been added successfully.`,
        });
      } else if (selectedProduct?._id) {
        const response = await fetch(`${API_URL}/products/${selectedProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update product');
        }

        toast({
          title: "Success",
          description: `${formData.name} has been updated successfully.`,
        });
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${product._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast({
        title: "Success",
        description: `${product.name} has been removed.`,
      });

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <Label htmlFor="product-search" className="text-foreground">Search Products</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="product-search"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ethnic_wear">Ethnic Wear</SelectItem>
              <SelectItem value="western_wear">Western Wear</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">E</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{products.filter((p) => p.category === "ethnic_wear").length}</p>
                <p className="text-xs text-muted-foreground">Ethnic Wear</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">W</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{products.filter((p) => p.category === "western_wear").length}</p>
                <p className="text-xs text-muted-foreground">Western Wear</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">★</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{products.filter((p) => p.isBestseller).length}</p>
                <p className="text-xs text-muted-foreground">Bestsellers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading products...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tags</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product._id || product.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.subcategory}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {categoryLabels[product.category] || product.category}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">₹{product.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.isNew && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                          {product.isBestseller && (
                            <Badge variant="default" className="text-xs">Bestseller</Badge>
                          )}
                          {product.isSummer && (
                            <Badge variant="outline" className="text-xs">Summer</Badge>
                          )}
                          {product.isWinter && (
                            <Badge variant="outline" className="text-xs">Winter</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products found.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAddMode ? "Add New Product" : "Edit Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label>Product Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted border border-border">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setFormData({ ...formData, image: "" });
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-md hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/50 hover:bg-muted flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Click to upload image</span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              <Label>Additional Images (up to 6 total)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted border border-border group">
                    <img
                      src={preview}
                      alt={`Product preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 6 && (
                  <button
                    type="button"
                    onClick={() => document.getElementById("multi-image-input")?.click()}
                    className="w-full aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/50 hover:bg-muted flex flex-col items-center justify-center gap-1 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground text-center">
                      {imagePreviews.length === 0 ? "Add images" : `+${6 - imagePreviews.length}`}
                    </span>
                  </button>
                )}
              </div>
              <input
                id="multi-image-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultipleImagesChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                You can upload up to 6 images. First image is used as main product image.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="4999"
                />
              </div>
              <div className="space-y-2">
                <Label>Original Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="6999"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethnic_wear">Ethnic Wear</SelectItem>
                    <SelectItem value="western_wear">Western Wear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select
                  value={formData.subcategory || ""}
                  onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && subcategories[formData.category as keyof typeof subcategories]?.map((sub) => (
                      <SelectItem key={sub} value={sub || ""}>
                        {sub}
                      </SelectItem>
                    )) || null}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sizes (comma separated)</Label>
                <Input
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="S, M, L, XL"
                />
              </div>
              <div className="space-y-2">
                <Label>Colors</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md border-border bg-muted/30 min-h-[44px]">
                    {formData.colors.split(",").map((color) => {
                      const trimmedColor = color.trim();
                      return trimmedColor ? (
                        <span
                          key={trimmedColor}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                        >
                          {trimmedColor}
                          <button
                            type="button"
                            onClick={() => {
                              const colors = formData.colors
                                .split(",")
                                .map(c => c.trim())
                                .filter(c => c && c !== trimmedColor)
                                .join(", ");
                              setFormData({ ...formData, colors });
                            }}
                            className="hover:opacity-70"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="color-input"
                      placeholder="Add a color..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = (e.target as HTMLInputElement);
                          const newColor = input.value.trim();
                          if (newColor && !formData.colors.includes(newColor)) {
                            const colors = formData.colors ? formData.colors + ", " + newColor : newColor;
                            setFormData({ ...formData, colors });
                            input.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById("color-input") as HTMLInputElement;
                        if (input && input.value.trim()) {
                          const newColor = input.value.trim();
                          if (!formData.colors.includes(newColor)) {
                            const colors = formData.colors ? formData.colors + ", " + newColor : newColor;
                            setFormData({ ...formData, colors });
                            input.value = "";
                          }
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Press Enter or click Add to add colors</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between">
                <Label>New Arrival</Label>
                <Switch
                  checked={formData.isNew}
                  onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Bestseller</Label>
                <Switch
                  checked={formData.isBestseller}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBestseller: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Summer Collection</Label>
                <Switch
                  checked={formData.isSummer}
                  onCheckedChange={(checked) => setFormData({ ...formData, isSummer: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Winter Collection</Label>
                <Switch
                  checked={formData.isWinter}
                  onCheckedChange={(checked) => setFormData({ ...formData, isWinter: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isAddMode ? "Add Product" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
