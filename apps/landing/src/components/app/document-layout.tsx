import React from 'react';
import { Heading, Muted, Subheading } from '@/components/app/typography';

interface DocumentLayoutProps {
  title: string;
  meta?: string;
  children: React.ReactNode;
}

export function DocumentLayout({ title, meta, children }: DocumentLayoutProps) {
  return (
    <article className="space-y-6">
      <header className="space-y-1">
        <Heading>{title}</Heading>
        {meta ? <Muted>{meta}</Muted> : null}
      </header>
      <div className="space-y-5">{children}</div>
    </article>
  );
}

interface DocumentSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DocumentSection({ title, children }: DocumentSectionProps) {
  return (
    <section className="space-y-1.5">
      <Subheading>{title}</Subheading>
      {children}
    </section>
  );
}
