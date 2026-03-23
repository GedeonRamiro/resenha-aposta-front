"use client";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FiSidebar } from "react-icons/fi";
import { useSidebarStore } from "@/components/sidebar-store";

const mockUser = {
  name: "Gedeon Ramio",
  logged: true,
};

export function Header() {
  const [user, setUser] = useState(mockUser);
  const { openSidebar } = useSidebarStore();

  return (
    <header className="w-full fixed top-0 left-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2 h-16">
        <div className="flex items-center gap-4">
          {/* Botão de abrir sidebar (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
            onClick={openSidebar}
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
          {user.logged ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium  sm:inline">
                {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUser({ ...user, logged: false })}
              >
                Sair
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setUser({ ...user, logged: true })}
            >
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
