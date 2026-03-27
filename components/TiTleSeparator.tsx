import { Separator } from "./ui/separator";

export default function TiTleSeparator({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pb-6">
      <Separator className="flex-1 bg-primary" />
      <span className="text-lg font-semibold text-primary">{title}</span>
      <Separator className="flex-1 bg-primary" />
    </div>
  );
}
