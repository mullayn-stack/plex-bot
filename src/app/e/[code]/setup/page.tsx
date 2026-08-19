import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validTagCode } from "@/lib/validation";
import { SetupWizard } from "@/components/setup-wizard";
import { saveAndActivateProfile } from "./actions";

export default async function SetupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  if (!validTagCode(code)) notFound();

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?next=${encodeURIComponent(`/e/${code}/setup`)}`);

  const publicClient = (await import("@/lib/supabase/public")).createPublicClient();
  const { data } = await publicClient.rpc("public_emergency_profile", { p_code: code });
  const tag = Array.isArray(data) ? data[0] : null;
  if (!tag) notFound();
  if (tag.tag_status === "active") redirect(`/e/${code}`);
  if (tag.tag_status === "disabled") redirect(`/e/${code}`);

  return (
    <main className="shell setup-shell">
      <header className="setup-header"><p className="eyebrow">Nate&apos;s Krafts · Emergency NFC</p><h1>Set up your emergency profile</h1><p>Tag <code>{code}</code></p></header>
      <section className="card"><SetupWizard code={code} action={saveAndActivateProfile} /></section>
    </main>
  );
}
