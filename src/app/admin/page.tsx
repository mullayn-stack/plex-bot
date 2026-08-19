import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { changeTagState, createTags } from "./actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/admin");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return <main className="shell"><section className="card"><p className="eyebrow">Nate&apos;s Krafts · Seller admin</p><h1>Admin access not enabled</h1><p>Your account is signed in, but it has not been granted the seller admin role.</p></section></main>;
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.slice(0, 50) : null;
  const status = typeof params.status === "string" && ["unactivated", "active", "disabled"].includes(params.status) ? params.status : null;
  const { data: tags, error } = await supabase.rpc("admin_list_tags", { p_search: search, p_status: status, p_limit: 250 });
  if (error) throw new Error("Could not load tags.");

  const counts = (tags || []).reduce((acc: Record<string, number>, tag: { status: string }) => { acc[tag.status] = (acc[tag.status] || 0) + 1; return acc; }, {});

  return (
    <main className="shell admin-shell">
      <header className="account-header"><div><p className="eyebrow">Nate&apos;s Krafts</p><h1>Emergency NFC admin</h1><p>Create and manage physical NFC tag IDs without opening customer medical records.</p></div></header>

      <section className="stats-grid"><div className="stat"><strong>{counts.unactivated || 0}</strong><span>Unactivated</span></div><div className="stat"><strong>{counts.active || 0}</strong><span>Active</span></div><div className="stat"><strong>{counts.disabled || 0}</strong><span>Disabled</span></div></section>

      <section className="card admin-tools">
        <div><h2>Create tags</h2><p>Generate secure random 12-character tag codes.</p></div>
        <form action={createTags} className="inline-form"><label>Quantity<input name="count" type="number" min="1" max="100" defaultValue="1" /></label><button className="button button-primary" type="submit">Generate</button></form>
      </section>

      <section className="card">
        <div className="section-heading"><div><h2>Tag inventory</h2><p>The dashboard intentionally does not show medical profile contents.</p></div></div>
        <form className="filter-form" method="get"><input name="q" placeholder="Search tag code" defaultValue={search || ""} /><select name="status" defaultValue={status || ""}><option value="">All statuses</option><option value="unactivated">Unactivated</option><option value="active">Active</option><option value="disabled">Disabled</option></select><button className="button button-secondary" type="submit">Filter</button></form>

        <div className="table-wrap"><table><thead><tr><th>Tag ID</th><th>Status</th><th>Created</th><th>Activated</th><th>NFC URL</th><th>Actions</th></tr></thead><tbody>{(tags || []).map((tag: any) => {
          const url = `${origin}/e/${tag.code}`;
          return <tr key={tag.code}><td><code>{tag.code}</code></td><td><span className={`status status-${tag.status}`}>{tag.status}</span></td><td>{new Date(tag.created_at).toLocaleDateString("en-GB")}</td><td>{tag.activated_at ? new Date(tag.activated_at).toLocaleDateString("en-GB") : "—"}</td><td><code className="url-code">{url}</code></td><td><form action={changeTagState} className="action-form"><input type="hidden" name="code" value={tag.code} />{tag.status !== "disabled" && <button name="action" value="disable" className="mini-button">Disable</button>}{tag.status === "disabled" && tag.activated_at && <button name="action" value="reactivate" className="mini-button">Reactivate</button>}<button name="action" value="reset" className="mini-button danger-mini">Reset</button></form></td></tr>;
        })}</tbody></table></div>
      </section>
    </main>
  );
}
