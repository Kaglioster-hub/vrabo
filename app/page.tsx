export const dynamic = "force-dynamic";
export const revalidate = 0;

import dyn from "next/dynamic";
const Client = dyn(() => import("./page.client").then(m => m.default), { ssr: false });

export default function Page() {
  return <Client />;
}

