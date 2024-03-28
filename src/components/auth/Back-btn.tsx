"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BackBtnProps {
  label: string;
  href: string;
}

export default function BackBtn({ label, href }: BackBtnProps) {
  return (
    <Button variant="link" className="font-normal w-full" size="sm" asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
}
