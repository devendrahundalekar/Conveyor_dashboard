import type { ReactNode } from 'react';

interface Props {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Section({ title, action, children, className = '' }: Props) {
  return (
    <section className={`rounded-xl border border-slate-200/90 bg-white shadow-card overflow-hidden ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
        <h2 className="text-[15px] font-bold text-slate-800 tracking-tight">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
