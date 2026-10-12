import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-[88px] w-full rounded-lg border border-line bg-card px-3 py-2 text-[13.5px] text-ink placeholder:text-faint',
          'transition-[border-color,box-shadow] duration-150',
          'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25',
          className,
        )}
        {...props}
      />
    );
  },
);
