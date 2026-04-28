"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSidebarStore } from "@/components/sidebar-store";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBackendUser } from "@/lib/useBackendUser";
import { cn } from "@/lib/utils";
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
} from "@/components/ui/sidebar";
import {
  FiX,
  FiHome,
  FiTable,
  FiUser,
  FiUsers,
  FiBookOpen,
  FiBarChart2,
} from "react-icons/fi";
import { FaRegFutbol } from "react-icons/fa6";
import { ChevronDown } from "lucide-react";

const menuItems = [
  { label: "Início", href: "/", icon: <FiHome /> },
  { label: "Jogos", href: "/games", icon: <FaRegFutbol />, admin: true },
  { label: "Apostas", href: "/bets", icon: <FiBarChart2 />, admin: true },
  {
    label: "Minhas Apostas",
    href: "/users/me",
    icon: <FiUser />,
    requiresAuth: true,
  },
  { label: "Apostadores", href: "/users", icon: <FiUsers /> },
  { label: "Blog", href: "/blog", icon: <FiBookOpen />, admin: true },
  {
    label: "Ranking",
    href: "/user-scores",
    icon: <FiTable />,
    subItems: [
      { label: "Geral", href: "/user-scores?period=geral" },
      {
        label: "Abril",
        href: "/user-scores?period=abril&startDate=2026-04-03&endDate=2026-04-26",
      },
      {
        label: "Maio",
        href: "/user-scores?period=maio&startDate=2026-05-01&endDate=2026-05-25",
      },
    ],
  },
];

export function Sidebar() {
  const { open, closeSidebar } = useSidebarStore();
  const { isAuthenticated } = useBackendUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "geral";
  const isRankingRoute = pathname.startsWith("/user-scores");
  const [isRankingOpen, setIsRankingOpen] = useState(isRankingRoute);

  useEffect(() => {
    if (isRankingRoute) {
      setIsRankingOpen(true);
    }
  }, [isRankingRoute]);

  return (
    <>
      <SidebarRoot
        className={`border-primary/20 bg-linear-to-b from-primary/14 via-background to-primary/8 shadow-[0_22px_55px_-45px_rgba(234,88,12,0.6)] transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:fixed md:block md:top-16 md:h-[calc(100vh-4rem)]`}
        aria-hidden={!open && "true"}
      >
        <SidebarHeader className="border-primary/20 bg-primary/8 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            aria-label="Fechar menu"
          >
            <FiX size={24} />
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {menuItems.map((item) => {
              if (item.requiresAuth && !isAuthenticated) {
                return null;
              }

              const isParentActive =
                item.href === "/user-scores"
                  ? pathname.startsWith("/user-scores")
                  : pathname === item.href;

              if (item.href === "/user-scores" && item.subItems) {
                return (
                  <div key={item.href}>
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "w-full justify-between rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                        isParentActive
                          ? "border-primary/35 bg-primary/18 text-primary hover:bg-primary/20"
                          : "border-transparent hover:border-primary/20 hover:bg-primary/10",
                      )}
                      onClick={() => setIsRankingOpen((current) => !current)}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          isRankingOpen ? "rotate-180" : "rotate-0",
                        )}
                      />
                    </Button>

                    <div
                      className={cn(
                        "ml-6 mt-2 overflow-hidden border-l border-primary/20 pl-3 transition-all duration-200",
                        isRankingOpen
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="flex flex-col gap-1 py-1">
                        {item.subItems.map((subItem) => {
                          const isCurrentSubItem =
                            pathname.startsWith("/user-scores") &&
                            subItem.href.includes(`period=${currentPeriod}`);

                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={closeSidebar}
                              aria-current={
                                isCurrentSubItem ? "page" : undefined
                              }
                              className={cn(
                                "rounded-md px-2 py-1.5 text-xs transition-colors",
                                isCurrentSubItem
                                  ? "bg-primary/15 text-primary"
                                  : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
                              )}
                            >
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.href}>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "justify-start gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      isParentActive
                        ? "border-primary/35 bg-primary/18 text-primary hover:bg-primary/20"
                        : "border-transparent hover:border-primary/20 hover:bg-primary/10",
                    )}
                    onClick={closeSidebar}
                  >
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className="flex flex-1 items-center gap-3"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </SidebarGroup>
        </SidebarContent>
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
