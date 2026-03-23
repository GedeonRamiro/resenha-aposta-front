"use client";
import Link from "next/link";
import { useState } from "react";
import { useSidebarStore } from "@/components/sidebar-store";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  FiMenu,
  FiX,
  FiHome,
  FiTable,
  FiUsers,
  FiBookOpen,
  FiBarChart2,
  FiShield,
} from "react-icons/fi";
import { FaRegFutbol } from "react-icons/fa6";

const menuItems = [
  { label: "Início", href: "/", icon: <FiHome /> },
  { label: "Jogos", href: "/jogos", icon: <FaRegFutbol />, admin: true },
  { label: "Apostas", href: "/apostas", icon: <FiBarChart2 />, admin: true },
  { label: "Apostadores", href: "/apostadores", icon: <FiUsers /> },
  { label: "Blog", href: "/blog", icon: <FiBookOpen />, admin: true },
  { label: "Ranking", href: "/ranking", icon: <FiTable /> },
];

// Simulação de autenticação e role (substitua por contexto real depois)
const mockUser = {
  name: "Usuário",
  logged: true,
  isAdmin: true,
};

export function Sidebar() {
  const { open, closeSidebar } = useSidebarStore();
  const [user, setUser] = useState(mockUser);
  const pathname = usePathname();

  return (
    <>
      <SidebarRoot
        className={`transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:fixed md:block`}
        aria-hidden={!open && "true"}
      >
        <SidebarHeader>
          <span className="flex items-center gap-2 font-bold text-lg">
            <FiShield className="text-primary" /> Resenha Aposta
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={closeSidebar}
            aria-label="Fechar menu"
          >
            <FiX size={24} />
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {menuItems.map((item) => {
              if (item.admin && !user.isAdmin) return null;
              return (
                <Button
                  asChild
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="justify-start gap-3 px-3 py-2 text-sm font-medium"
                  onClick={closeSidebar}
                >
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex flex-1 items-center gap-3"
                  >
                    {item.icon}
                    {item.label}
                    {item.admin && (
                      <span className="ml-auto text-xs text-primary flex items-center gap-1">
                        <FiShield /> ADM
                      </span>
                    )}
                  </Link>
                </Button>
              );
            })}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between">
            {/* Espaço para outros itens do footer, se necessário */}
          </div>
        </SidebarFooter>
      </SidebarRoot>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeSidebar}
          aria-label="Fechar menu"
        />
      )}
    </>
  );
}
