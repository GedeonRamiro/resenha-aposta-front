import TiTleSeparator from "@/components/TiTleSeparator";
import { getBets } from "@/lib/bets";
import { getBlogPosts } from "@/lib/blog-posts";
import { getGames } from "@/lib/games";
import { getUserScores } from "@/lib/user-scores";
import HeroSection from "./page/components/HeroSection";
import RecentGames from "./page/components/RecentGames";
import RecentBets from "./page/components/RecentBets";
import BlogHighlight from "./page/components/BlogHighlight";
import TopRanking from "./page/components/TopRanking";
import News from "@/components/news";

export default async function Home() {
  const [gamesResult, betsResult, rankingResult, postsResult] =
    await Promise.allSettled([
      getGames(1, undefined, undefined, 10),
      getBets(1, undefined, undefined, 20),
      getUserScores(),
      getBlogPosts(1, undefined, 5),
    ]);

  const games = gamesResult.status === "fulfilled" ? gamesResult.value : null;
  const bets = betsResult.status === "fulfilled" ? betsResult.value : null;
  const ranking =
    rankingResult.status === "fulfilled" ? rankingResult.value : null;
  const posts = postsResult.status === "fulfilled" ? postsResult.value : null;

  const todayGames = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  const gamesToday =
    games?.data?.filter((game) => {
      const gameDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
      }).format(new Date(game.gameDate));

      return gameDate === todayGames;
    }) ?? [];

  const todayBets = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  const betsToday =
    bets?.data?.filter((bet) => {
      const betDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
      }).format(new Date(bet.game.gameDate));

      return betDate === todayBets;
    }) ?? [];

  const topGames =
    gamesToday.length > 0 ? gamesToday : (games?.data?.slice(0, 10) ?? []);

  const topBets =
    betsToday.length > 0 ? betsToday : (bets?.data?.slice(0, 100) ?? []);

  //const topGames = games?.data?.slice(0, 10) ?? [];
  //const topBets = bets?.data?.slice(0, 100) ?? [];
  const topRanking = ranking?.slice(0, 5) ?? [];
  const latestPosts = posts?.data?.slice(0, 5) ?? [];

  console.log(topBets);

  return (
    <div className="space-y-8 pb-6">
      <HeroSection
        gamesCount={games?.count ?? 0}
        betsCount={bets?.totalBets ?? 0}
        rankingCount={ranking?.length ?? 0}
        postsCount={posts?.count ?? 0}
      />

      <TiTleSeparator title="Resumo Geral" />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <RecentGames games={topGames} />
        <RecentBets bets={topBets} />
        <BlogHighlight posts={latestPosts} />
        <TopRanking ranking={topRanking} />
      </section>

      <section className="space-y-3">
        <TiTleSeparator title="Noticias" />
        <News />
      </section>
    </div>
  );
}
