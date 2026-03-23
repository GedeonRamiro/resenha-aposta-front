import LiveMatches from "@/components/liveMatches";
import News from "@/components/news";

export default function Home() {
  return (
    <div>
      <div className="space-y-2">
        <LiveMatches />
      </div>
      <News />
    </div>
  );
}
