"use client";

import { usePathname } from "next/navigation";
import StickyNav from "@/components/StickyNav";

const HIDE_NAV_ON = ["/"];

export default function NavWrapper() {
  const pathname = usePathname();
  if (HIDE_NAV_ON.includes(pathname)) return null;
  return <StickyNav />;
}