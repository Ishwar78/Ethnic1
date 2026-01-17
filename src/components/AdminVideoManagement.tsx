import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Video, Loader2, Play, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { parseVideoSource } from "@/lib/videoUtils";

interface VideoItem {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  url: string;
  category: string;
  price: number;
  originalPrice: number;
  badge?: string | null;
  isActive: boolean;
  productId: string;
  order: number;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Video Preview Component - Shows preview for all video types
 */
interface VideoPreviewProps {
  url: string;
}

const VideoPreview = ({ url }: VideoPreviewProps) => {
  if (!url) return null;

  const videoSource = parseVideoSource(url);
  const isYouTube = videoSource.type === 'youtube';
  const isVimeo = videoSource.type === 'vimeo';
  const isInstagram = videoSource.type === 'instagram';
  const isTikTok = videoSource.type === 'tiktok';
  const isHtml5 = videoSource.type === 'html5';

  return (
    <div className="mt-3 space-y-2">
      {isYouTube && videoSource.embedUrl && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-black">
          <iframe
            src={videoSource.embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      )}
      {isVimeo && videoSource.embedUrl && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-black">
          <iframe
            src={videoSource.embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      )}
      {isInstagram && videoSource.embedUrl && (
        <div className="relative w-full rounded-lg overflow-hidden border border-border bg-black/5 p-4 flex items-center justify-center min-h-40">
          <div className="text-center">
            <ExternalLink className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Instagram Preview</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1">
              Open in Instagram
            </a>
          </div>
        </div>
      )}
      {isTikTok && videoSource.embedUrl && (
        <div className="relative w-full rounded-lg overflow-hidden border border-border bg-black/5 p-4 flex items-center justify-center min-h-40">
          <div className="text-center">
            <Play className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">TikTok Video</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1">
              Open on TikTok
            </a>
          </div>
        </div>
      )}
      {isHtml5 && videoSource.directUrl && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-black">
          <video
            src={videoSource.directUrl}
            className="w-full h-full object-cover"
            controls
            onError={(e) => {
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

const AdminVideoManagement = () => {
  const { token } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "ETHNIC WEAR",
    price: "",
    originalPrice: "",
    badge: "",
    isActive: true,
    productId: ""
  });

  // Load videos on mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/videos/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error("Failed to load videos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.url || !formData.price || !formData.originalPrice) {
      toast.error("Title, URL, price and original price are required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        category: formData.category,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        badge: formData.badge && formData.badge !== 'none' ? formData.badge : null,
        isActive: formData.isActive,
        productId: formData.productId,
      };

      if (editingVideo?._id) {
        // Update video
        const response = await fetch(`${API_URL}/videos/${editingVideo._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to update video');
        }

        toast.success("Video updated successfully");
      } else {
        // Create new video
        const response = await fetch(`${API_URL}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create video');
        }

        toast.success("Video added successfully");
      }

      resetForm();
      fetchVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error(error instanceof Error ? error.message : "Failed to save video");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      category: "ETHNIC WEAR",
      price: "",
      originalPrice: "",
      badge: "",
      isActive: true,
      productId: ""
    });
    setEditingVideo(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (video: VideoItem) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      url: video.url,
      category: video.category,
      price: video.price.toString(),
      originalPrice: video.originalPrice.toString(),
      badge: video.badge || "",
      isActive: video.isActive,
      productId: video.productId
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/videos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      toast.success("Video deleted successfully");
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error("Failed to delete video");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const video = videos.find(v => v._id === id || v.id === id);
      if (!video) return;

      const response = await fetch(`${API_URL}/videos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...video,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update video');
      }

      toast.success("Video status updated");
      fetchVideos();
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error("Failed to update video");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Management</h2>
          <p className="text-muted-foreground">Manage trending videos displayed on homepage</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Edit Video" : "Add New Video"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Festive Special Dress"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Video URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://... (YouTube, Instagram, TikTok, Vimeo, or direct video link)"
                  type="url"
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ Supports: YouTube links • Instagram Reels/Posts • TikTok videos • Vimeo • Direct MP4/WebM links (Pixabay, Pexels, etc.)
                </p>
                {formData.url && (
                  <VideoPreview url={formData.url} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Video description..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., ETHNIC WEAR"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="badge">Badge (Optional)</Label>
                  <Select
                    value={formData.badge}
                    onValueChange={(value) => setFormData({ ...formData, badge: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="BESTSELLER">Bestseller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productId">Product ID (Optional)</Label>
                <Input
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  placeholder="MongoDB ID or custom ID"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1" disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingVideo ? "Update" : "Add"} Video
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter(v => v.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter(v => !v.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Videos List */}
      <Card>
        <CardHeader>
          <CardTitle>All Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading videos...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No videos added yet. Click "Add Video" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => (
                <div
                  key={video._id || video.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-border bg-black/10 flex items-center justify-center">
                      {parseVideoSource(video.url).type === 'html5' ? (
                        <video
                          src={video.url}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                          <Play className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{video.title}</h3>
                        {video.badge && (
                          <Badge variant="outline" className="text-xs">
                            {video.badge}
                          </Badge>
                        )}
                        {!video.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {video.category} • ₹{video.price} (was ₹{video.originalPrice})
                      </p>
                      {video.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={video.isActive}
                      onCheckedChange={() => toggleActive(video._id || video.id, video.isActive)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(video._id || video.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVideoManagement;
