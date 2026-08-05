import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md bg-[#ff7b39] px-4 py-2 font-bold text-[#08110f] transition hover:bg-[#ff9a56] ${className}`}
      {...props}
    />
  );
}
