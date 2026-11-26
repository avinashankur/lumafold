import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'border-input text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring aria-invalid:border-destructive flex h-8 w-full rounded-md border bg-[var(--surface-2)] px-2.5 py-1 text-xs shadow-xs transition-colors outline-none file:border-0 file:bg-transparent file:text-xs file:font-medium hover:border-[var(--border-active)] focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
