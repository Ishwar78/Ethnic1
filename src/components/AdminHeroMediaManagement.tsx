import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit2, Plus, Play, Upload, X } from "lucide-react";
import { getVideoSource } from "@/lib/videoUtils";

interface HeroMedia {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  mediaUrl: string;
  mediaType: 'video' | 'gif' | 'image';
  cta: string;
  ctaLink: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminHeroMediaManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [media, setMedia] = useState<HeroMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    mediaUrl: '',
    mediaType: 'video' as const,
    cta: 'Shop Now',
    ctaLink: '',
    order: 0,
  });
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch media
  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/hero-media/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMedia(data.media);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hero media',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMedia();
    }
  }, [token]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subtitle || !formData.description || !formData.mediaUrl || !formData.ctaLink) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = editingId
        ? `${API_URL}/hero-media/${editingId}`
        : `${API_URL}/hero-media`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save media');
      }

      toast({
        title: 'Success',
        description: editingId ? 'Media updated successfully' : 'Media created successfully',
      });

      resetForm();
      fetchMedia();
    } catch (error) {
      console.error('Error saving media:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save media',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (item: HeroMedia) => {
    setFormData({
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      mediaUrl: item.mediaUrl,
      mediaType: item.mediaType,
      cta: item.cta,
      ctaLink: item.ctaLink,
      order: item.order,
    });
    setMediaPreview(item.mediaUrl);
    setEditingId(item._id);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`${API_URL}/hero-media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete media');
      }

      toast({
        title: 'Success',
        description: 'Media deleted successfully',
      });

      fetchMedia();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete media',
        variant: 'destructive',
      });
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData({ ...formData, mediaUrl: base64 });
      setMediaPreview(base64);
      setUploadProgress(100);

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });

      // Reset progress after 2 seconds
      setTimeout(() => setUploadProgress(0), 2000);
    };

    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    };

    reader.readAsDataURL(file);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      mediaUrl: '',
      mediaType: 'video',
      cta: 'Shop Now',
      ctaLink: '',
      order: 0,
    });
    setMediaPreview(null);
    setUploadProgress(0);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Add Media Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Hero Slider Media Management</h2>
        <Button onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add New Media'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Media' : 'Add New Media'}</CardTitle>
            <CardDescription>Upload video, GIF, or image for hero slider</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., New Arrivals"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-foreground">Subtitle *</Label>
                <Input
                  id="subtitle"
                  placeholder="e.g., Festive Suit Collection"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Discover exquisite handcrafted ethnic wear for every occasion"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              {/* Media Type */}
              <div className="space-y-2">
                <Label htmlFor="mediaType" className="text-foreground">Media Type *</Label>
                <Select value={formData.mediaType} onValueChange={(value: any) => setFormData({ ...formData, mediaType: value })}>
                  <SelectTrigger id="mediaType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video (YouTube/Instagram/MP4)</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                    <SelectItem value="image">Image (JPG/PNG)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="media-upload" className="text-foreground">Upload Media File (or enter URL below)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden">
                  <input
                    type="file"
                    id="media-upload"
                    accept={formData.mediaType === 'video' ? 'video/*,.mp4,.webm,.mov' : formData.mediaType === 'gif' ? 'image/gif' : 'image/*'}
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {mediaPreview ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-600">✓ File Selected</p>
                      <p className="text-xs text-muted-foreground">Click to change</p>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-muted rounded-full h-1 mt-2">
                          <div
                            className="bg-primary h-1 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">Upload Media</p>
                      <p className="text-xs text-muted-foreground">
                        {formData.mediaType === 'image' && 'PNG, JPG up to 10MB'}
                        {formData.mediaType === 'gif' && 'GIF up to 10MB'}
                        {formData.mediaType === 'video' && 'MP4, WebM up to 100MB'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Media Preview */}
              {mediaPreview && (
                <div className="space-y-2">
                  <Label className="text-foreground">Media Preview</Label>
                  <div className="rounded-lg overflow-hidden bg-muted max-w-xs">
                    {formData.mediaType === 'image' || formData.mediaType === 'gif' ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="w-full h-auto max-h-64 object-cover"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        className="w-full h-auto max-h-64 object-cover"
                        controls
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({ ...formData, mediaUrl: '' });
                      setMediaPreview(null);
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              )}

              {/* Media URL */}
              <div className="space-y-2">
                <Label htmlFor="mediaUrl" className="text-foreground">Or Enter Media URL</Label>
                <Input
                  id="mediaUrl"
                  placeholder="YouTube, Instagram, or direct video/image link"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                />
                <div className="text-xs text-muted-foreground space-y-1 mt-2 p-2 bg-muted rounded">
                  <p className="font-semibold text-foreground">How to add videos:</p>
                  <p>📺 <strong>YouTube:</strong> https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID</p>
                  <p>📸 <strong>Instagram:</strong> https://www.instagram.com/p/POST_ID/ or https://www.instagram.com/reel/REEL_ID/</p>
                  <p>🎬 <strong>Direct Video:</strong> https://example.com/video.mp4</p>
                </div>
              </div>

              {/* CTA Text */}
              <div className="space-y-2">
                <Label htmlFor="cta" className="text-foreground">Call to Action Button Text</Label>
                <Input
                  id="cta"
                  placeholder="e.g., Shop Now"
                  value={formData.cta}
                  onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                />
              </div>

              {/* CTA Link */}
              <div className="space-y-2">
                <Label htmlFor="ctaLink" className="text-foreground">CTA Link *</Label>
                <Input
                  id="ctaLink"
                  placeholder="e.g., /shop?category=new-arrivals"
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  required
                />
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label htmlFor="order" className="text-foreground">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first (0 = first slide)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingId ? 'Update Media' : 'Create Media'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Media List */}
      <div className="grid gap-4">
        {media.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No hero media found. Create one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          media.map((item) => (
            <Card key={item._id} className={item.isActive ? '' : 'opacity-50'}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Media Preview */}
                  <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center relative group">
                    {item.mediaType === 'video' ? (
                      <>
                        {item.mediaUrl.includes('youtube.com') || item.mediaUrl.includes('youtu.be') ? (
                          <div className="w-full h-full bg-red-900/20 flex flex-col items-center justify-center gap-1">
                            <Play className="w-6 h-6 text-red-500" />
                            <span className="text-white text-xs font-medium">YouTube</span>
                          </div>
                        ) : item.mediaUrl.includes('instagram.com') ? (
                          <div className="w-full h-full bg-pink-900/20 flex flex-col items-center justify-center gap-1">
                            <Play className="w-6 h-6 text-pink-500" />
                            <span className="text-white text-xs font-medium">Instagram</span>
                          </div>
                        ) : (
                          <>
                            <video
                              src={item.mediaUrl}
                              className="w-full h-full object-cover"
                              muted
                              onError={(e) => {
                                console.error('Video load error:', e);
                                const target = e.currentTarget;
                                target.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    {(!item.mediaUrl || item.mediaUrl === '') && (
                      <div className="text-xs text-muted-foreground text-center p-2">No media</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>

                    <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                      <span>Type: <strong>{item.mediaType}</strong></span>
                      <span>Order: <strong>{item.order}</strong></span>
                      <span>CTA: <strong>{item.cta}</strong></span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
