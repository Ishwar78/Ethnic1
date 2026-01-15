/**
 * Extracts video ID from YouTube URL and returns embed URL
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    // Handle youtu.be short URLs
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&mute=1`;

    // Handle youtube.com URLs with watch?v=
    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&mute=1`;

    // Handle already embed URLs
    if (url.includes('youtube.com/embed/')) {
      return url.includes('autoplay=1') ? url : url + (url.includes('?') ? '&' : '?') + 'autoplay=1&mute=1';
    }

    return null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
}

/**
 * Extracts video ID from Instagram URL and returns embed URL
 */
export function getInstagramEmbedUrl(url: string): string | null {
  try {
    // Handle instagram.com/p/ (posts) and /reel/ (reels)
    const postMatch = url.match(/instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)\/?/);
    if (postMatch) {
      const postId = postMatch[2];
      return `https://www.instagram.com/${postMatch[1]}/${postId}/embed/caption/?cr=1&v=14`;
    }

    return null;
  } catch (error) {
    console.error('Error parsing Instagram URL:', error);
    return null;
  }
}

/**
 * Determines the video source type and returns appropriate embed/direct URL
 */
export function getVideoSource(url: string): {
  type: 'youtube' | 'instagram' | 'direct' | 'unknown';
  src: string;
} {
  if (!url) return { type: 'unknown', src: '' };

  // Check for YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const embedUrl = getYouTubeEmbedUrl(url);
    if (embedUrl) return { type: 'youtube', src: embedUrl };
  }

  // Check for Instagram
  if (url.includes('instagram.com')) {
    const embedUrl = getInstagramEmbedUrl(url);
    if (embedUrl) return { type: 'instagram', src: embedUrl };
  }

  // Direct video URL
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return { type: 'direct', src: url };
  }

  // Assume direct URL if no pattern matches
  return { type: 'direct', src: url };
}

/**
 * Checks if URL is a valid video source
 */
export function isValidVideoUrl(url: string): boolean {
  const source = getVideoSource(url);
  return source.type !== 'unknown';
}
