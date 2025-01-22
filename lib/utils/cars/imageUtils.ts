import supabase from "@/lib/supabaseClient";
// Helper function to clean image URLs
export function cleanImageUrl(rawUrl: string | null): string {
  if (!rawUrl || rawUrl === "null") return ""; // Handle null or "null" string

  let imageUrl = ""; // Initialize with empty string
  try {
    const imageData = JSON.parse(rawUrl);
    if (imageData && imageData.image_link) {
      imageUrl = imageData.image_link;
    } else {
      imageUrl = rawUrl;
    }
  } catch (e) {
    imageUrl = rawUrl;
    console.log("image path cleanup error", e);
  }

  // Only try to replace if imageUrl is a string
  return typeof imageUrl === "string"
    ? imageUrl.replace(/[\[\]\n\s"]/g, "").replace(/^\/\//, "https://")
    : "";
}

// Function to download and upload image
export async function handleImage(
  imageUrl: string,
  make: string,
  model: string
) {
  try {
    console.log("Attempting to download car image:", imageUrl);

    const response = await fetch(imageUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();

    console.log("Image downloaded, size:", buffer.byteLength);

    const fileName = `${make.toLowerCase()}-${model.toLowerCase()}.jpg`;
    console.log("Uploading to storage as:", fileName);

    const { data, error } = await supabase.storage
      .from("car-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) throw error;
    console.log("Upload successful, path:", data.path);
    return data.path;
  } catch (error) {
    console.error("Image processing failed:", error);
    return null;
  }
}
