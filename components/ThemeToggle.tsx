"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Alternar tema"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M17.75 15.5a7.25 7.25 0 0 1-7.25-7.25c0-1.61.52-3.1 1.41-4.3A.75.75 0 0 0 10.1 2.1a9.25 9.25 0 1 0 11.8 11.8a.75.75 0 0 0-1.85-.81a7.19 7.19 0 0 1-2.3.41Z"
          />
        </svg>
      ) : (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12Zm0 2.25a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0V21a.75.75 0 0 1 .75-.75Zm0-16.5a.75.75 0 0 1 .75.75V5a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75Zm8.25 7.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75Zm-16.5 0a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75Zm13.44 6.19a.75.75 0 0 1 1.06 1.06l-.35.35a.75.75 0 1 1-1.06-1.06l.35-.35Zm-11.32 0a.75.75 0 0 1 1.06 0l.35.35a.75.75 0 1 1-1.06 1.06l-.35-.35a.75.75 0 0 1 0-1.06Zm11.32-11.32a.75.75 0 0 1 1.06 1.06l-.35.35a.75.75 0 1 1-1.06-1.06l.35-.35Zm-11.32 0a.75.75 0 0 1 1.06 0l.35.35a.75.75 0 1 1-1.06 1.06l-.35-.35a.75.75 0 0 1 0-1.06Z"
          />
        </svg>
      )}
    </Button>
  );
}
