// src/lib/utils.ts

// This function takes a Supabase image URL and returns a URL
// for a smaller, optimized version of the image.
export const getOptimizedImageUrl = (
    url: string, 
    width: number, 
    height: number
  ): string => {
    if (!url) return 'https://placehold.co/200x200?text=No+Image';
    
    // Use the 'render/image/upload' path for Supabase's transformation API
    const transformedUrl = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/upload/'
    );
    
    return `${transformedUrl}?width=${width}&height=${height}&resize=cover`;
  };