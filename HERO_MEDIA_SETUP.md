# Hero Slider Media Management - Complete Guide ✅

## What's New

You now have the ability to upload and manage **Videos**, **GIFs**, and **Images** for the hero slider directly from the admin panel!

---

## How to Use

### Step 1: Access Admin Dashboard
1. Go to: `http://localhost:8080/vastra/admin`
2. Login with: 
   - Email: `admin@vasstra.com`
   - Password: `admin@123`

### Step 2: Navigate to Hero Slider
In the left sidebar, click on **"Hero Slider"** (with film icon 🎬)

Or go to: `http://localhost:8080/admin?tab=hero-media`

### Step 3: Upload New Media

#### Click "Add New Media" button

Fill in the form:

| Field | Description | Example |
|-------|-------------|---------|
| **Title** * | Main title shown | "New Arrivals" |
| **Subtitle** * | Secondary heading | "Festive Suit Collection" |
| **Description** * | Full description text | "Discover exquisite handcrafted ethnic wear..." |
| **Media Type** * | Choose: Video, GIF, or Image | "video" |
| **Media URL** * | Full URL to your video/GIF/image | `https://example.com/video.mp4` |
| **CTA Text** | Button text | "Shop Now" |
| **CTA Link** | Where button leads | `/shop?category=new-arrivals` |
| **Display Order** | Lower = appears first (0 = first slide) | 0 |

### Step 4: Save
Click **"Create Media"** or **"Update Media"** button

---

## Supported Formats

### Videos
- **Format:** MP4
- **Recommended Size:** 1920x1080
- **Max Size:** 50MB
- **Codec:** H.264 (for browser compatibility)

**Example URL:**
```
https://example.com/hero-video.mp4
https://cdn.example.com/promo.mp4
```

### GIFs
- **Format:** GIF (animated)
- **Recommended Size:** 1920x1080
- **Max Size:** 10MB

**Example URL:**
```
https://example.com/hero-animation.gif
```

### Images
- **Format:** JPG, PNG, WebP
- **Recommended Size:** 1920x1080
- **Max Size:** 5MB

**Example URL:**
```
https://example.com/hero-image.jpg
```

---

## Where to Host Your Media

You need a URL for your video/GIF/image. Choose one:

### Option 1: Free Hosting Services
- **Imgur** (images & GIFs) - https://imgur.com
- **Gfycat** (GIFs) - https://gfycat.com
- **CloudConvert** (convert & host) - https://cloudconvert.com

### Option 2: Cloud Storage
- **AWS S3** - Amazon cloud storage
- **Google Cloud Storage** - Google's solution
- **Azure Blob Storage** - Microsoft's solution
- **Firebase Storage** - Google's Firebase

### Option 3: CDN Services
- **Cloudinary** - Image & video CDN
- **Bunny CDN** - Global CDN
- **DigitalOcean Spaces** - Cloud storage

### Option 4: Local Server (if self-hosted)
- Upload files to your server
- Use direct URL: `https://yourdomain.com/videos/hero.mp4`

---

## Example: Adding a Video

### Step-by-Step Example

1. **Upload your video** to Cloudinary or similar service
2. **Get the video URL**, e.g., `https://res.cloudinary.com/demo/video/upload/v123/hero.mp4`
3. **Go to Admin → Hero Slider**
4. **Click "Add New Media"**
5. **Fill the form:**
   - Title: `Winter Collection`
   - Subtitle: `Stay Warm in Style`
   - Description: `Explore our new winter ethnic wear collection with premium fabrics`
   - Media Type: `Video`
   - Media URL: `https://res.cloudinary.com/demo/video/upload/v123/hero.mp4`
   - CTA: `Shop Winter Collection`
   - CTA Link: `/shop?category=winter-wear`
   - Order: `0`
6. **Click "Create Media"**
7. **Refresh frontend** to see the video in hero slider

---

## Managing Media

### View All Media
All uploaded media appears as cards below the form showing:
- Thumbnail preview
- Title, subtitle, media type
- Active/Inactive status
- Edit and Delete buttons

### Edit Media
1. Click the **"Edit"** button on any card
2. Modify the fields
3. Click **"Update Media"**

### Delete Media
1. Click the **"Delete"** button on any card
2. Confirm deletion
3. Media is removed

### Activate/Deactivate
- **Active:** Media displays on the website
- **Inactive:** Media is hidden from the website

---

## Database Schema

The hero media is stored in MongoDB with this structure:

```javascript
{
  _id: ObjectId,
  title: String,
  subtitle: String,
  description: String,
  mediaUrl: String,        // Full URL to video/GIF/image
  mediaType: String,       // 'video', 'gif', or 'image'
  cta: String,            // Call-to-action button text
  ctaLink: String,        // Where button links to
  order: Number,          // Display order (lower = first)
  isActive: Boolean,      // Whether to show on website
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Get Active Media (Public)
```
GET /api/hero-media
```

Returns all active hero media sorted by display order.

### Get All Media (Admin Only)
```
GET /api/hero-media/admin/all
Headers: Authorization: Bearer {token}
```

Returns all media including inactive ones.

### Create Media (Admin Only)
```
POST /api/hero-media
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "New Arrivals",
  "subtitle": "Festive Suit Collection",
  "description": "Discover exquisite handcrafted ethnic wear",
  "mediaUrl": "https://example.com/video.mp4",
  "mediaType": "video",
  "cta": "Shop Now",
  "ctaLink": "/shop?category=new-arrivals",
  "order": 0
}
```

### Update Media (Admin Only)
```
PUT /api/hero-media/{id}
Content-Type: application/json
Authorization: Bearer {token}

{ ...same fields as create... }
```

### Delete Media (Admin Only)
```
DELETE /api/hero-media/{id}
Authorization: Bearer {token}
```

---

## Frontend Integration

The HeroSlider component automatically:
1. Fetches active media from `/api/hero-media`
2. Falls back to default static images if no media exists
3. Supports auto-play videos (muted, looped)
4. Supports animated GIFs
5. Supports static images
6. Auto-rotates slides every 6 seconds
7. Supports manual navigation with arrow buttons

### Video Features
- ✅ Auto-plays (muted for autoplay policy)
- ✅ Loops continuously
- ✅ Works on mobile
- ✅ Responsive sizing

### Image Features
- ✅ Responsive sizing
- ✅ Proper aspect ratios
- ✅ Gradient overlay for text readability

---

## Troubleshooting

### Videos Not Playing
**Issue:** Video URL shows but doesn't play

**Solutions:**
- Ensure video is MP4 format
- Check URL is accessible (not behind login)
- Try hosting on Cloudinary or similar CDN
- Check browser console for CORS errors

### Media Not Appearing
**Issue:** Added media but doesn't show on website

**Solutions:**
1. Check if media is **Active** (not Inactive)
2. Refresh the frontend page
3. Check if media URL is correct and accessible
4. Verify media type matches the file

### Image Not Loading
**Issue:** Image URL is entered but not showing

**Solutions:**
- Verify image URL is publicly accessible
- Try different image hosting service
- Check image format (JPG, PNG, WebP supported)
- Ensure URL is not behind CORS restrictions

### API Error When Creating Media
**Issue:** Error when submitting form

**Solutions:**
- Fill all required fields (marked with *)
- Ensure mediaUrl is a valid URL
- Check if you're logged in as admin
- Check browser console for error details

---

## Best Practices

### 1. Video Quality
- Use 1920x1080 resolution
- Compress to reduce file size
- Use H.264 codec for compatibility

### 2. File Size
- Videos: < 50MB
- GIFs: < 10MB
- Images: < 5MB

### 3. Performance
- Use CDN for hosting (Cloudinary, Bunny CDN)
- Compress media before uploading
- Use appropriate formats (MP4 > WebM > MOV)

### 4. Accessibility
- Write descriptive titles and subtitles
- Provide meaningful CTA text
- Use readable fonts on background media

### 5. Mobile Optimization
- Test on mobile browsers
- Ensure media looks good at all sizes
- Use portrait + landscape formats if needed

---

## Example URLs (Test)

You can test with these free media URLs:

**Sample Video:**
```
https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
```

**Sample GIF:**
```
https://media4.giphy.com/media/3o7TKCxEEDTCNbqYs0/giphy.gif
```

**Sample Image:**
```
https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=1920&h=1080&fit=crop
```

---

## Managing Display Order

The `order` field controls which slide appears first:
- **0** = First slide (shown on load)
- **1** = Second slide
- **2** = Third slide
- etc.

Lower numbers appear first. Update the `order` value to rearrange slides.

---

## Features Summary

✅ **Video Support** - MP4 videos with auto-play
✅ **GIF Support** - Animated GIFs
✅ **Image Support** - JPG, PNG, WebP
✅ **Admin Interface** - Easy upload form
✅ **Edit/Delete** - Manage existing media
✅ **Active/Inactive** - Control visibility
✅ **Display Order** - Arrange slides
✅ **Preview** - See thumbnails in admin
✅ **Responsive** - Works on all devices
✅ **Fast Loading** - Optimized for performance

---

## Next Steps

1. ✅ Find or create your media files
2. ✅ Upload to a CDN or hosting service
3. ✅ Get the direct URL
4. ✅ Go to Admin → Hero Slider
5. ✅ Add new media with the URL
6. ✅ Publish and view on website

---

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify your media URLs are correct
3. Ensure you're logged in as admin
4. Check browser console for error messages
5. Test with sample URLs from the guide

---

All set! Your hero slider is now ready for videos and GIFs! 🎬
