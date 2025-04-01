import supabase from "@/lib/supabaseClient";

interface ImagePathObject {
  image_link: string;
}

export function cleanImageUrl(rawUrl: string | null | ImagePathObject): string {
  if (!rawUrl || rawUrl === "null") return "";

  // Handle image_path object format
  let imageUrl = rawUrl;
  if (typeof rawUrl === "object") {
    imageUrl = (rawUrl as ImagePathObject).image_link || "";
  }

  // Clean the URL and ensure it has https:// prefix
  return typeof imageUrl === "string"
    ? imageUrl.startsWith("//")
      ? `https:${imageUrl}`
      : imageUrl
    : "";
}

export async function handleImage(
  imageUrl: string,
  make: string,
  model: string
): Promise<string | null> {
  try {
    console.log("Attempting to download car image:", imageUrl);

    const cleanUrl = cleanImageUrl(imageUrl);
    if (!cleanUrl) {
      console.log("No valid URL after cleaning");
      return null;
    }

    console.log("Cleaned URL:", cleanUrl);

    const response = await fetch(cleanUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();

    console.log("Image downloaded, size:", buffer.byteLength);

    const fileName = `${make.toLowerCase()}-${model
      .toLowerCase()
      .replace(/\s+/g, "_")}.jpg`;
    console.log("Uploading to storage as:", fileName);

    const { data, error } = await supabase.storage
      .from("car-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    console.log("Upload successful, path:", data.path);

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("car-images").getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Image processing failed:", error);
    return null;
  }
}
