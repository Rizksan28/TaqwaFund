import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "gold";
  children: ReactNode;
};

const variants = {
  primary: "bg-emeraldDark text-white hover:bg-emeraldBrand",
  secondary: "bg-mint text-emeraldDark hover:bg-[#d6f0e7]",
  ghost: "bg-transparent text-emeraldDark hover:bg-mint",
  gold: "bg-[#806000] text-white hover:bg-[#6c5100]"
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children
}: {
  href: string;
  variant?: ButtonProps["variant"];
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
