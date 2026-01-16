/**
 * Utility functions for handling different video sources
 * Supports: HTML5 videos, YouTube, Instagram Reels, TikTok, etc.
 */

export type VideoType = 'html5' | 'youtube' | 'instagram' | 'tiktok' | 'vimeo' | 'unknown';

export interface VideoSource {
  type: VideoType;
  embedUrl?: string;
  directUrl?: string;
  videoId?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Instagram Reel/Post ID from URL
 * Supports: instagram.com/reel/..., instagram.com/p/...
 */
export function extractInstagramId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /instagram\.com\/(reel|p)\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[2]) {
      return match[2];
    }
  }

  return null;
}

/**
 * Extract TikTok video ID from URL
 * Supports: tiktok.com/@.../video/..., vm.tiktok.com/...
 */
export function extractTikTokId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /tiktok\.com\/.*\/video\/(\d+)/,
    /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
    /vt\.tiktok\.com\/([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 * Supports: vimeo.com/..., player.vimeo.com/video/...
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Detect video type from URL
 */
export function detectVideoType(url: string): VideoType {
  if (!url) return 'unknown';

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }

  if (lowerUrl.includes('instagram.com')) {
    return 'instagram';
  }

  if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com') || lowerUrl.includes('vt.tiktok.com')) {
    return 'tiktok';
  }

  if (lowerUrl.includes('vimeo.com') || lowerUrl.includes('player.vimeo.com')) {
    return 'vimeo';
  }

  // Check if it's a direct video URL
  if (
    lowerUrl.endsWith('.mp4') ||
    lowerUrl.endsWith('.webm') ||
    lowerUrl.endsWith('.ogg') ||
    lowerUrl.endsWith('.mov') ||
    lowerUrl.includes('video') ||
    lowerUrl.includes('pixabay') ||
    lowerUrl.includes('pexels')
  ) {
    return 'html5';
  }

  return 'html5'; // Default to html5 for unknown URLs
}

/**
 * Get video source details from URL
 */
export function parseVideoSource(url: string): VideoSource {
  const type = detectVideoType(url);

  const source: VideoSource = {
    type,
    directUrl: url,
  };

  switch (type) {
    case 'youtube':
      source.videoId = extractYouTubeId(url) || undefined;
      if (source.videoId) {
        source.embedUrl = `https://www.youtube.com/embed/${source.videoId}?autoplay=1&mute=1&controls=1&modestbranding=1`;
      }
      break;

    case 'instagram':
      source.videoId = extractInstagramId(url) || undefined;
      if (source.videoId) {
        source.embedUrl = `https://www.instagram.com/p/${source.videoId}/embed`;
      }
      break;

    case 'vimeo':
      source.videoId = extractVimeoId(url) || undefined;
      if (source.videoId) {
        source.embedUrl = `https://player.vimeo.com/video/${source.videoId}?autoplay=1&mute=1`;
      }
      break;

    case 'tiktok':
      source.videoId = extractTikTokId(url) || undefined;
      if (source.videoId) {
        source.embedUrl = `https://www.tiktok.com/embed/v2/${source.videoId}`;
      }
      break;

    case 'html5':
    default:
      // For HTML5 videos, use the direct URL
      source.embedUrl = url;
      break;
  }

  return source;
}

/**
 * Check if a video source supports autoplay
 */
export function supportsAutoplay(type: VideoType): boolean {
  // HTML5 videos support autoplay if muted
  // YouTube, Vimeo support autoplay with parameters
  // Instagram, TikTok don't support direct autoplay
  switch (type) {
    case 'instagram':
    case 'tiktok':
      return false;
    default:
      return true;
  }
}

/**
 * Alias for parseVideoSource for backward compatibility
 */
export function getVideoSource(url: string): VideoSource {
  return parseVideoSource(url);
}
