"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";

const NAV_OUT_DURATION = 220;

/**
 * Link que aplica transição de saída (fade-out) antes de navegar,
 * evitando corte seco entre páginas (Design System — motion).
 * Suporta ref para leitura de offsetTop (pill deslizante da sidebar).
 */
export const AnimatedLink = forwardRef<
  HTMLAnchorElement,
  ComponentProps<typeof Link>
>(function AnimatedLink({ href, onClick, children, ...props }, ref) {
  const router = useRouter();
  const isExternal =
    typeof href === "string" && (href.startsWith("http") || href.startsWith("//"));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isExternal) return;
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    document.body.classList.add("hubia-navigate-out");
    setTimeout(() => {
      router.push(typeof href === "string" ? href : href.pathname ?? "/");
      document.body.classList.remove("hubia-navigate-out");
    }, NAV_OUT_DURATION);
  };

  if (isExternal) {
    return (
      <Link href={href} ref={ref} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} ref={ref} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
});
