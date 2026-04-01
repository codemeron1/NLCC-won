import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;

    const { data, error } = await supabase.storage
      .from("lesson-images")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("lesson-images")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload image", details: error.message }, { status: 500 });
  }
}
