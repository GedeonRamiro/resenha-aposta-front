import Link from "next/link";

const footerLinks = [
  { label: "Inicio", href: "/" },
  { label: "Jogos", href: "/games" },
  { label: "Blog", href: "/blog" },
  { label: "Ranking", href: "/user-scores" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-primary/25 bg-linear-to-r from-primary/18 via-primary/10 to-primary/18 md:ml-64">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Resenha Aposta © {currentYear}. Desenvolvido por Gedeon Ramiro. Todos
          os direitos reservados.
        </p>

        <nav aria-label="Links do rodape" className="flex flex-wrap gap-2">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-primary/30 bg-primary/14 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/22 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
