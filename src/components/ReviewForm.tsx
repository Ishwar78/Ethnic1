import { useState, useRef } from "react";
import { Star, ImagePlus, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const reviewSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().trim().min(10, "Review must be at least 10 characters").max(500, "Review must be less than 500 characters"),
});

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  productId: string | number;
  images?: string[];
}

interface ReviewFormProps {
  productId: string | number;
  onReviewSubmitted: (review: Review) => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; rating?: string; comment?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images.",
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Each image must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = reviewSchema.safeParse({ name, rating, comment });

    if (!result.success) {
      const fieldErrors: { name?: string; rating?: string; comment?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field as keyof typeof fieldErrors] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newReview: Review = {
      id: `review-${Date.now()}`,
      name: result.data.name,
      rating: result.data.rating,
      comment: result.data.comment,
      date: "Just now",
      productId,
      images: images.length > 0 ? images : undefined,
    };

    onReviewSubmitted(newReview);

    toast({
      title: "Review Submitted!",
      description: "Thank you for sharing your feedback.",
    });

    // Reset form
    setName("");
    setRating(0);
    setComment("");
    setImages([]);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/30 rounded-xl p-6 space-y-6">
      <h3 className="font-display text-xl font-semibold">Write a Review</h3>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium mb-3">Your Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoverRating || rating) >= star
                    ? "text-gold fill-gold"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-destructive text-sm mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Your Name *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={50}
          className={cn(errors.name && "border-destructive")}
        />
        {errors.name && (
          <p className="text-destructive text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-2">Your Review *</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          maxLength={500}
          className={cn(errors.comment && "border-destructive")}
        />
        <div className="flex justify-between mt-1">
          {errors.comment ? (
            <p className="text-destructive text-sm">{errors.comment}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {comment.length}/500
          </span>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <div className="flex flex-wrap gap-3">
          {/* Uploaded Images Preview */}
          {images.map((img, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
              <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* Add Image Button */}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">Add</span>
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Max 5 images, 5MB each</p>
      </div>

      <Button type="submit" variant="hero" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
