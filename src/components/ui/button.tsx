import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md bg-vt-primary px-4 py-2 font-bold text-vt-ink transition hover:bg-vt-primary-hover ${className}`}
      {...props}
    />
  );
}
