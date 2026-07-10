import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100", className)}>{children}</span>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("glass rounded-3xl p-6", className)}>{children}</div>;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" };
export function Button({ children, variant = "primary", className, ...props }: ButtonProps) {
  return <button {...props} className={cn("rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60", variant === "primary" ? "bg-gradient-to-r from-aqua to-mint text-ink shadow-glow" : "border border-white/15 bg-white/10 text-white", className)}>{children}</button>;
}
