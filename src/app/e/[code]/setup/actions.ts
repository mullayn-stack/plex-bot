"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cleanText, phone, requiredText, validTagCode } from "@/lib/validation";

export async function saveAndActivateProfile(formData: FormData) {
  const code = String(formData.get("tag_code") || "").toUpperCase();
  if (!validTagCode(code)) throw new Error("Invalid tag code.");

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) redirect(`/login?next=${encodeURIComponent(`/e/${code}/setup`)}`);

  const payload = {
    owner_id: user.id,
    full_name: requiredText(formData.get("full_name"), "Full name"),
    date_of_birth: cleanText(formData.get("date_of_birth"), 10),
    medical_conditions: cleanText(formData.get("medical_conditions"), 3000),
    allergies: cleanText(formData.get("allergies"), 3000),
    medications: cleanText(formData.get("medications"), 3000),
    blood_type: cleanText(formData.get("blood_type"), 10),
    important_medical_notes: cleanText(formData.get("important_medical_notes"), 3000),
    primary_contact_name: requiredText(formData.get("primary_contact_name"), "Primary emergency contact"),
    primary_contact_relationship: cleanText(formData.get("primary_contact_relationship"), 80),
    primary_contact_phone: phone(formData.get("primary_contact_phone"), true),
    secondary_contact_name: cleanText(formData.get("secondary_contact_name"), 120),
    secondary_contact_relationship: cleanText(formData.get("secondary_contact_relationship"), 80),
    secondary_contact_phone: phone(formData.get("secondary_contact_phone")),
    home_location: cleanText(formData.get("home_location"), 500),
    additional_notes: cleanText(formData.get("additional_notes"), 3000),
  };

  const { data: existing } = await supabase
    .from("emergency_profiles")
    .select("id, profile_photo_path")
    .eq("owner_id", user.id)
    .maybeSingle();

  let photoPath = existing?.profile_photo_path ?? null;
  const photo = formData.get("profile_photo");
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > 2_000_000) throw new Error("Profile photo must be 2 MB or smaller.");
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(photo.type)) throw new Error("Profile photo must be JPG, PNG or WebP.");
    const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    photoPath = `${user.id}/profile.${extension}`;
    const { error: uploadError } = await supabase.storage.from("profile-photos").upload(photoPath, photo, { upsert: true, contentType: photo.type });
    if (uploadError) throw new Error("Could not upload the profile photo.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("emergency_profiles")
    .upsert({ ...payload, profile_photo_path: photoPath }, { onConflict: "owner_id" })
    .select("id")
    .single();
  if (profileError || !profile) throw new Error("Could not save the emergency profile.");

  const { data: activated, error: activationError } = await supabase.rpc("activate_tag", { p_code: code, p_profile_id: profile.id });
  if (activationError || !activated) throw new Error("This tag could not be activated. It may already have been claimed.");

  redirect(`/e/${code}?activated=1`);
}
