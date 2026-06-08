"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSidebarStore } from "@/components/sidebar-store";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBackendUser } from "@/lib/useBackendUser";
import {
  APP_CONFIG_UPDATED_EVENT,
  getConfig,
  RankingSeason,
} from "@/lib/config";
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
  FiPlusCircle,
  FiSettings,
} from "react-icons/fi";
import { FaRegFutbol } from "react-icons/fa6";
import { ChevronDown } from "lucide-react";

type RankingSubItem = {
  label: string;
  href: string;
};

type GameQuickFilterKey = "all" | "today" | "tomorrow" | "next3" | "next7";

type GamesSubItem = {
  label: string;
  key: GameQuickFilterKey;
  href: string;
};

type BetQuickFilterKey = "all" | "today" | "tomorrow" | "next3" | "last3";

type BetsSubItem = {
  label: string;
  key: BetQuickFilterKey;
  href: string;
};

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function seasonToHref(season: RankingSeason) {
  const params = new URLSearchParams();
  params.set("period", season.slug);
  params.set("startDate", season.startDate);
  params.set("endDate", season.endDate);
  return `/user-scores?${params.toString()}`;
}

function getLocalStartOfDay(value: Date): Date {
  const localDate = new Date(value);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
}

function toLocalStartOfDayIso(value: Date): string {
  return getLocalStartOfDay(value).toISOString();
}

function toLocalEndExclusiveIso(value: Date): string {
  const localEndExclusive = getLocalStartOfDay(value);
  localEndExclusive.setDate(localEndExclusive.getDate() + 1);
  return localEndExclusive.toISOString();
}

function gameQuickFilterToHref(filter: GameQuickFilterKey): string {
  const params = new URLSearchParams();
  params.set("page", "1");
  params.set("quickFilter", filter);

  if (filter === "all") {
    return `/games?${params.toString()}`;
  }

  const today = getLocalStartOfDay(new Date());
  const from = new Date(today);
  let to = new Date(today);

  if (filter === "tomorrow") {
    from.setDate(from.getDate() + 1);
    to = new Date(from);
  }

  if (filter === "next3") {
    to.setDate(to.getDate() + 3);
  }

  if (filter === "next7") {
    to.setDate(to.getDate() + 7);
  }

  params.set("startDate", toLocalStartOfDayIso(from));
  params.set("endDate", toLocalEndExclusiveIso(to));

  return `/games?${params.toString()}`;
}

function betQuickFilterToHref(filter: BetQuickFilterKey): string {
  const params = new URLSearchParams();
  params.set("page", "1");
  params.set("quickFilter", filter);

  if (filter === "all") {
    return `/bets?${params.toString()}`;
  }

  const today = getLocalStartOfDay(new Date());
  const from = new Date(today);
  let to = new Date(today);

  if (filter === "tomorrow") {
    from.setDate(from.getDate() + 1);
    to = new Date(from);
  }

  if (filter === "next3") {
    to.setDate(to.getDate() + 3);
  }

  if (filter === "last3") {
    from.setDate(from.getDate() - 3);
  }

  params.set("startDate", toLocalStartOfDayIso(from));
  params.set("endDate", toLocalEndExclusiveIso(to));

  return `/bets?${params.toString()}`;
}

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
    subItems: [{ label: "Geral", href: "/user-scores?period=geral" }],
  },
];

export function Sidebar() {
  const { open, closeSidebar } = useSidebarStore();
  const { isAuthenticated, isAdmin } = useBackendUser();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "geral";
  const currentGameQuickFilter = searchParams.get("quickFilter") || "all";
  const currentBetQuickFilter = searchParams.get("quickFilter") || "all";
  const isGamesRoute = pathname.startsWith("/games");
  const isBetsRoute = pathname.startsWith("/bets");
  const isRankingRoute = pathname.startsWith("/user-scores");
  const [isGamesOpen, setIsGamesOpen] = useState(isGamesRoute);
  const [isBetsOpen, setIsBetsOpen] = useState(isBetsRoute);
  const [isRankingOpen, setIsRankingOpen] = useState(isRankingRoute);
  const gamesOpen = isGamesOpen || isGamesRoute;
  const betsOpen = isBetsOpen || isBetsRoute;
  const rankingOpen = isRankingOpen || isRankingRoute;
  const [rankingSubItems, setRankingSubItems] = useState<RankingSubItem[]>([
    { label: "Geral", href: "/user-scores?period=geral" },
  ]);
  const gameSubItems: GamesSubItem[] = [
    { label: "Todos", key: "all", href: gameQuickFilterToHref("all") },
    { label: "Hoje", key: "today", href: gameQuickFilterToHref("today") },
    {
      label: "Amanhã",
      key: "tomorrow",
      href: gameQuickFilterToHref("tomorrow"),
    },
    {
      label: "Próximos 3 dias",
      key: "next3",
      href: gameQuickFilterToHref("next3"),
    },
    {
      label: "Próximos 7 dias",
      key: "next7",
      href: gameQuickFilterToHref("next7"),
    },
  ];
  const betSubItems: BetsSubItem[] = [
    { label: "Todas", key: "all", href: betQuickFilterToHref("all") },
    { label: "Hoje", key: "today", href: betQuickFilterToHref("today") },
    {
      label: "Amanhã",
      key: "tomorrow",
      href: betQuickFilterToHref("tomorrow"),
    },
    {
      label: "Próximos 3 dias",
      key: "next3",
      href: betQuickFilterToHref("next3"),
    },
    {
      label: "Ultimos 3 dias",
      key: "last3",
      href: betQuickFilterToHref("last3"),
    },
  ];

  const loadRankingSubItems = useCallback(() => {
    getConfig()
      .then((config) => {
        const seasons = (config.rankingSeasons ?? []).map((season) => ({
          label: season.label,
          href: seasonToHref(season),
        }));

        setRankingSubItems([
          { label: "Geral", href: "/user-scores?period=geral" },
          ...seasons,
        ]);
      })
      .catch(() => {
        setRankingSubItems([
          { label: "Geral", href: "/user-scores?period=geral" },
        ]);
      });
  }, []);

  useEffect(() => {
    loadRankingSubItems();
    window.addEventListener(APP_CONFIG_UPDATED_EVENT, loadRankingSubItems);

    return () => {
      window.removeEventListener(APP_CONFIG_UPDATED_EVENT, loadRankingSubItems);
    };
  }, [loadRankingSubItems]);

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
              // Keep auth-only items hidden until mount to avoid SSR/client mismatch.
              if (item.requiresAuth && (!isClient || !isAuthenticated)) {
                return null;
              }

              const isParentActive =
                item.href === "/user-scores"
                  ? pathname.startsWith("/user-scores")
                  : item.href === "/games"
                    ? pathname.startsWith("/games")
                    : item.href === "/bets"
                      ? pathname.startsWith("/bets")
                      : pathname === item.href;

              if (item.href === "/games") {
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
                      onClick={() => setIsGamesOpen((current) => !current)}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          gamesOpen ? "rotate-180" : "rotate-0",
                        )}
                      />
                    </Button>

                    <div
                      className={cn(
                        "ml-6 mt-2 overflow-hidden border-l border-primary/20 pl-3 transition-all duration-200",
                        gamesOpen
                          ? "max-h-48 opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="flex flex-col gap-1 py-1">
                        {gameSubItems.map((subItem) => {
                          const isCurrentSubItem =
                            pathname.startsWith("/games") &&
                            currentGameQuickFilter === subItem.key;

                          return (
                            <Link
                              key={subItem.key}
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

              if (item.href === "/user-scores") {
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
                          rankingOpen ? "rotate-180" : "rotate-0",
                        )}
                      />
                    </Button>

                    <div
                      className={cn(
                        "ml-6 mt-2 overflow-hidden border-l border-primary/20 pl-3 transition-all duration-200",
                        rankingOpen
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="flex flex-col gap-1 py-1">
                        {rankingSubItems.map((subItem) => {
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

              if (item.href === "/bets") {
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
                      onClick={() => setIsBetsOpen((current) => !current)}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          betsOpen ? "rotate-180" : "rotate-0",
                        )}
                      />
                    </Button>

                    <div
                      className={cn(
                        "ml-6 mt-2 overflow-hidden border-l border-primary/20 pl-3 transition-all duration-200",
                        betsOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="flex flex-col gap-1 py-1">
                        {betSubItems.map((subItem) => {
                          const isCurrentSubItem =
                            pathname.startsWith("/bets") &&
                            currentBetQuickFilter === subItem.key;

                          return (
                            <Link
                              key={subItem.key}
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

          {isAdmin && (
            <SidebarGroup className="border-t border-primary/20 pt-2">
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "justify-start gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/teams"
                    ? "border-primary/35 bg-primary/18 text-primary hover:bg-primary/20"
                    : "border-transparent hover:border-primary/20 hover:bg-primary/10",
                )}
                onClick={closeSidebar}
              >
                <Link
                  href="/teams"
                  aria-current={pathname === "/teams" ? "page" : undefined}
                  className="flex flex-1 items-center gap-3"
                >
                  <FiPlusCircle />
                  Times
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                className={cn(
                  "justify-start gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors mt-2",
                  pathname === "/competitions"
                    ? "border-primary/35 bg-primary/18 text-primary hover:bg-primary/20"
                    : "border-transparent hover:border-primary/20 hover:bg-primary/10",
                )}
                onClick={closeSidebar}
              >
                <Link
                  href="/competitions"
                  aria-current={
                    pathname === "/competitions" ? "page" : undefined
                  }
                  className="flex flex-1 items-center gap-3"
                >
                  <FiPlusCircle />
                  Competições
                </Link>
              </Button>

              {isAdmin ? (
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "justify-start gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/settings"
                      ? "border-primary/35 bg-primary/18 text-primary hover:bg-primary/20"
                      : "border-transparent hover:border-primary/20 hover:bg-primary/10",
                  )}
                  onClick={closeSidebar}
                >
                  <Link
                    href="/settings"
                    aria-current={pathname === "/settings" ? "page" : undefined}
                    className="flex flex-1 items-center gap-3"
                  >
                    <FiSettings />
                    Configurações
                  </Link>
                </Button>
              ) : null}
            </SidebarGroup>
          )}
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
