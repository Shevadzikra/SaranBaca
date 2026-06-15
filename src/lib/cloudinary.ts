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
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
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

export async function updateImageContext(publicId: string, alt: string, caption: string): Promise<void> {
  const contextString = `alt=${alt || ""} | caption=${caption || ""}`;
  await cloudinary.uploader.add_context(contextString, [publicId]);
}

export { cloudinary };
