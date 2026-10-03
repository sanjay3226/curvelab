import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
  className?: string;
};

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-800 text-neutral-400',
          className
        )}
      >
        <span className="h-[1.125rem] w-[1.125rem]" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-800 text-neutral-300 transition-colors',
        'hover:bg-neutral-850 hover:text-neutral-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        className
      )}
    >
      <span
        className={cn('iconify h-[1.125rem] w-[1.125rem]', {
          'ph--moon-bold': isDark,
          'ph--sun-bold': !isDark,
        })}
      />
    </button>
  );
};

export default ThemeToggle;
