/**
 * Common image URLs for games (fallback if scraping fails)
 */
export const GAME_FALLBACK_IMAGES: Record<string, string> = {
  rust: "https://files.facepunch.com/rust/blog/header_2024_10.jpg",
  tarkov: "https://assets.tarkov.com/news/15/banner_15_0.jpg",
  poe: "https://web.poecdn.com/public/news/2024-07-18/SettlersOfKalguurHeader.jpg",
  fortnite: "https://cdn2.unrealengine.com/fortnite-chapter-5-season-4-header-1920x1080-6927d7802163.jpg",
  diablo4: "https://bnetcmsus-a.akamaihd.net/cms/blog_header/x4/X499874868Z61727473723366.jpg",
};

/**
 * Build media items from WipeData
 * This is a helper to construct the mediaItems array consistently
 */
export function buildMediaItems(wipeData: any, gameImage?: string) {
  const mediaItems: { type: "image" | "video" | "youtube"; src: string; alt: string }[] = [];

  console.log("🔍 buildMediaItems - wipeData:", {
    hasChangelog: !!wipeData?.changelog,
    hasImages: !!wipeData?.changelog?.images,
    imagesLength: wipeData?.changelog?.images?.length,
    hasVideos: !!wipeData?.videos,
    videosLength: wipeData?.videos?.length,
  });

  // Add additional images from changelog.images array FIRST (high priority)
  if (wipeData?.changelog?.images && Array.isArray(wipeData.changelog.images)) {
    console.log(`✅ Adding ${wipeData.changelog.images.length} images from changelog.images`);
    wipeData.changelog.images.forEach((imageUrl: string, index: number) => {
      mediaItems.push({
        type: "image",
        src: imageUrl,
        alt: `${wipeData.eventName || "Season"} - ${index + 1}`,
      });
    });
  }
  // Skip adding changelog.imageUrl if it's already in the images array
  else if (wipeData?.changelog?.imageUrl) {
    console.log("✅ Adding 1 image from changelog.imageUrl");
    // Only add if images array doesn't exist
    mediaItems.push({
      type: "image",
      src: wipeData.changelog.imageUrl,
      alt: `${wipeData.eventName || "Season"} Image`,
    });
  }

  // Add changelog main video if available
  if (wipeData?.changelog?.videoUrl) {
    const isYouTube = wipeData.changelog.videoUrl.includes('youtube.com') ||
                      wipeData.changelog.videoUrl.includes('youtu.be');
    mediaItems.push({
      type: isYouTube ? "youtube" : "video",
      src: wipeData.changelog.videoUrl,
      alt: `${wipeData.eventName || "Season"} Video`,
    });
  }

  // Add feature images if available
  if (wipeData?.changelog?.features) {
    wipeData.changelog.features.forEach((feature: any) => {
      if (feature.imageUrl) {
        mediaItems.push({
          type: "image",
          src: feature.imageUrl,
          alt: feature.title,
        });
      }
    });
  }

  // Add videos from videos array
  if (wipeData?.videos && wipeData.videos.length > 0) {
    console.log(`✅ Adding ${wipeData.videos.length} videos from videos array`);
    wipeData.videos.slice(0, 5).forEach((video: any) => {
      mediaItems.push({
        type: "youtube",
        src: video.url,
        alt: video.title || "Video",
      });
    });
  }

  // Fallback to game background image if no media items
  if (mediaItems.length === 0 && gameImage) {
    console.log("⚠️ No media items found, using fallback game image");
    mediaItems.push({
      type: "image",
      src: gameImage,
      alt: "Game Image",
    });
  }

  console.log(`📦 Total mediaItems: ${mediaItems.length}`);
  return mediaItems;
}

/**
 * Fetch additional images for a game using Firecrawl
 * This scrapes the official game pages to get more media
 */
export async function fetchGameImages(gameId: string, limit: number = 10): Promise<string[]> {
  const imageUrls: string[] = [];

  try {
    const { firecrawlScrape, extractImagesFromMarkdown } = await import("../firecrawl-client");

    let targetUrl = "";

    // Determine the URL based on game ID
    if (gameId === "poe") {
      targetUrl = "https://www.pathofexile.com/affliction";
    } else if (gameId === "poe2") {
      targetUrl = "https://www.pathofexile.com/poe2";
    } else {
      console.warn(`⚠️ No image scraping configured for game: ${gameId}`);
      return [];
    }

    console.log(`🖼️ Fetching images for ${gameId} from ${targetUrl}`);

    const result = await firecrawlScrape({
      url: targetUrl,
      formats: ["markdown", "links"],
      onlyMainContent: true,
    });

    if (result?.data?.markdown) {
      const extractedImages = extractImagesFromMarkdown(result.data.markdown);

      // Filter for high-quality images (avoid small icons, logos, etc)
      const filteredImages = extractedImages.filter((url: string) => {
        return (
          !url.includes("icon") &&
          !url.includes("logo") &&
          !url.includes("favicon") &&
          (url.includes(".jpg") || url.includes(".png") || url.includes(".webp"))
        );
      });

      imageUrls.push(...filteredImages.slice(0, limit));
    }

    // Also try to get images from links array if available
    if (result?.data?.links && Array.isArray(result.data.links)) {
      result.data.links.forEach((link: string) => {
        if (
          link.match(/\.(jpg|jpeg|png|webp|gif)$/i) &&
          !imageUrls.includes(link)
        ) {
          imageUrls.push(link);
        }
      });
    }

    console.log(`✅ Found ${imageUrls.length} images for ${gameId}`);
    return imageUrls.slice(0, limit);
  } catch (error) {
    console.warn(`⚠️ Failed to fetch images for ${gameId}:`, error);
    return [];
  }
}
