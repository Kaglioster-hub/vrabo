export const dynamic = "force-dynamic";
export const revalidate = 0;

import dynamic from "next/dynamic";
const Client = dynamic(() => import("./page.client").then(m => m.default), { ssr: false });

export default function Page() {
  return <Client />;
}
