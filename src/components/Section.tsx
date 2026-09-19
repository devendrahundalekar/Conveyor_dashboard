import type { ReactNode } from 'react';

interface Props {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Section({ title, action, children, className = '' }: Props) {
  return (
    <section className={`rounded-md border border-line bg-panel ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
