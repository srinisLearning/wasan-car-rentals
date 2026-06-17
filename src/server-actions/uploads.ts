"use server";
import { createSupabaseServerClient } from "@/config/supabase-server-config";

const BUCKET_NAME = "main";

export const uploadFile = async (file: File) => {
  try {
    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Generate unique filename with timestamp and random string
    const fileExtension = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, file);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uniqueFileName);

    return {
      url: publicUrlData.publicUrl,
      fileName: uniqueFileName,
      success: true,
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during file upload.",
    };
  }
};