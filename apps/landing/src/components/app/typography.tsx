import React from 'react';
import { cn } from '@/lib/utils';

type TagName = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TagName;
}

export function Heading({
  as: Tag = 'h1',
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn('text-foreground text-base font-semibold', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Subheading({
  as: Tag = 'h2',
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn('text-foreground text-sm font-semibold', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Text({
  as: Tag = 'p',
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn('text-muted-foreground text-sm leading-relaxed', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Highlight({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <strong className={cn('text-foreground font-medium', className)} {...props}>
      {children}
    </strong>
  );
}

export function Muted({
  as: Tag = 'p',
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn('text-muted-foreground text-xs leading-relaxed', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function InlineCode({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        'bg-muted text-foreground rounded px-1 py-0.5 font-mono text-xs',
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
