"use client";
import dynamic from "next/dynamic";

const Platform = dynamic(() => import("./platform"), { ssr: false });

export default function Page() {
  return <Platform />;
}
