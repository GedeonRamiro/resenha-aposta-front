"use client";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { FiSidebar } from "react-icons/fi";
import { useSidebarStore } from "@/components/sidebar-store";
import { authClient } from "@/lib/auth-client";
import { useBackendUser } from "@/lib/useBackendUser";

export function Header() {
  const { data: sessionData, isPending } = authClient.useSession();
  useBackendUser();
  const { open, toggleSidebar } = useSidebarStore();

  const user = sessionData?.user;

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <header className="w-full fixed top-0 left-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2 h-16">
        <div className="flex items-center gap-4">
          {/* Botão de abrir sidebar (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={toggleSidebar}
          >
            <FiSidebar size={24} />
          </Button>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="rounded"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isPending ? (
            <Button size="sm" disabled>
              Carregando...
            </Button>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold  line-clamp-2 sm:max-w-none text-xs sm:text-sm text-primary/90">
                {user.name ?? user.email}
              </span>
              <Button variant="default" size="sm" onClick={handleSignOut}>
                Sair
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={handleSignIn} className="gap-2">
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
