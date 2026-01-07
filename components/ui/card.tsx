import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("mb-6", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h2
      className={cn(
        "text-2xl font-bold text-white",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ children, className }: CardProps) {
  return (
    <p className={cn("text-slate-400 mt-1", className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn("mt-6 pt-6 border-t border-slate-800", className)}>
      {children}
    </div>
  );
}
