import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: string, // base64 data URI or URL
  folder: string = "saranbaca",
  context?: { alt?: string; caption?: string }
): Promise<{ url: string; publicId: string }> {
  const uploadOptions: any = {
    folder,
    resource_type: "image",
  };

  // Add context if provided
  if (context && (context.alt || context.caption)) {
    uploadOptions.context = `alt=${context.alt || ""} | caption=${context.caption || ""}`;
  }

  const result = await cloudinary.uploader.upload(file, uploadOptions);

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export interface CloudinaryImage {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
  tags: string[];
  displayName?: string;
  context?: {
    custom?: {
      alt?: string;
      caption?: string;
    };
  };
}

export async function getImages(
  folder: string = "saranbaca", 
  maxResults: number = 10,
  nextCursor?: string
): Promise<{ images: CloudinaryImage[]; nextCursor?: string }> {
  try {
    const options: any = {
      type: "upload",
      prefix: folder,
      max_results: maxResults,
      context: true,
      tags: true,
    };
    
    if (nextCursor) {
      options.next_cursor = nextCursor;
    }

    const result = await cloudinary.api.resources(options);
    
    const images = result.resources.map((res: any) => ({
      url: res.secure_url,
      publicId: res.public_id,
      format: res.format,
      width: res.width,
      height: res.height,
      bytes: res.bytes,
      createdAt: res.created_at,
      tags: res.tags || [],
      displayName: res.display_name || undefined,
      context: res.context,
    }));

    return {
      images,
      nextCursor: result.next_cursor,
    };
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return { images: [] };
  }
}

export async function searchImages(
  query: string,
  folder: string = "saranbaca",
  maxResults: number = 30,
  nextCursor?: string
): Promise<{ images: CloudinaryImage[]; nextCursor?: string }> {
  try {
    // Sanitize query: remove special characters that break Cloudinary search expressions
    const sanitized = query.replace(/[\\\"\':\(\)\[\]\{\}\*\?\!\&\|\/\~\^]/g, "").trim();

    if (!sanitized) {
      // If query is empty after sanitization, return all images from folder
      const fallback = await getImages(folder, maxResults, nextCursor);
      return fallback;
    }

    // Build expression: search in display_name, context caption/alt, OR tags
    // Cloudinary Search API uses `context.caption` (NOT `context.custom.caption`)
    // `display_name` is the "title" field set via Cloudinary dashboard
    // The `:` operator does tokenized/partial matching for text fields
    const expression = `folder:${folder}/* AND (display_name:${sanitized} OR context.caption:${sanitized} OR context.alt:${sanitized} OR tags:${sanitized})`;

    let searchBuilder = cloudinary.search
      .expression(expression)
      .with_field("context")
      .with_field("tags")
      .sort_by("created_at", "desc")
      .max_results(maxResults);

    if (nextCursor) {
      searchBuilder = searchBuilder.next_cursor(nextCursor);
    }

    const result = await searchBuilder.execute();

    const images: CloudinaryImage[] = (result.resources || []).map((res: any) => {
      // Cloudinary Search API returns context as { alt, caption } (flat)
      // Admin API returns context as { custom: { alt, caption } }
      // Normalize to the { custom: { ... } } format for consistency
      let context = res.context;
      if (context && !context.custom) {
        context = { custom: { ...context } };
      }

      return {
        url: res.secure_url,
        publicId: res.public_id,
        format: res.format,
        width: res.width,
        height: res.height,
        bytes: res.bytes,
        createdAt: res.created_at,
        tags: res.tags || [],
        displayName: res.display_name || undefined, // untuk saat ini tidak memakai displayName, tetap ditulis karena mungkin dibutuhkan
        context,
      };
    });

    return {
      images,
      nextCursor: result.next_cursor,
    };
  } catch (error) {
    console.error("Error searching images from Cloudinary:", error);
    return { images: [] };
  }
}

export async function updateImageContext(publicId: string, alt: string, caption: string): Promise<void> {
  const contextString = `alt=${alt || ""} | caption=${caption || ""}`;
  await cloudinary.uploader.add_context(contextString, [publicId]);
}

export { cloudinary };
