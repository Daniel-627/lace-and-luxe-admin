import { sanityQuery } from "../../../lib/sanity";
import type { BlockData } from "../../../lib/blocks";
import HomeEditor from "../../../components/HomeEditor";
import SiteBar from "../../../components/SiteBar";

export const dynamic = "force-dynamic";

interface Data {
  home: { blocks?: BlockData[] } | null;
  site: { announcementEnabled?: boolean; announcement?: string } | null;
}

export default async function HomepagePage() {
  let data: Data | null = null;
  let problem = "";
  try {
    data = await sanityQuery<Data>(`{ "home": *[_id == "homePage"][0]{ blocks }, "site": *[_id == "siteSettings"][0]{ announcementEnabled, announcement } }`);
  } catch (e) {
    problem = e instanceof Error ? e.message : "Could not reach the content store";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Homepage</h1>
        <p className="mt-2 max-w-2xl text-sm text-claret/70">Add, reorder, schedule and edit the sections of the shop&apos;s homepage. Changes go live when you press Save.</p>
      </div>
      {problem ? (
        <div className="rounded-2xl border border-champagne/40 bg-white/60 p-6">
          <p className="font-medium">The homepage editor can&apos;t load yet.</p>
          <p className="mt-2 text-sm">{problem}</p>
          <p className="mt-2 text-sm text-claret/70">It needs a content token. Add <code>SANITY_WRITE_TOKEN</code> to this app&apos;s environment variables and redeploy.</p>
        </div>
      ) : (
        <>
          <SiteBar initialEnabled={data?.site?.announcementEnabled !== false} initialText={data?.site?.announcement ?? ""} />
          <HomeEditor initial={(data?.home?.blocks ?? []).filter(Boolean)} shopUrl={process.env.SHOP_URL} />
        </>
      )}
    </div>
  );
}
