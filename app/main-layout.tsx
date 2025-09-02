"use client"

import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <>
      {user && <Header />}
      <main>{children}</main>
      <Toaster />
    </>
  );
}
