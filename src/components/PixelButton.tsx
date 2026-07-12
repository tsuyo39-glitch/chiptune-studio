import type { ButtonHTMLAttributes } from 'react';

type PixelButtonVariant = 'normal' | 'accent';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant;
}

const variantClasses: Record<PixelButtonVariant, string> = {
  normal: 'bg-tone text-ink',
  accent: 'bg-accent text-paper',
};

export function PixelButton({
  variant = 'normal',
  className = '',
  type = 'button',
  ...rest
}: PixelButtonProps) {
  return (
    <button
      type={type}
      className={[
        'border-2 border-ink px-4 py-2 font-dot leading-none',
        'shadow-(--shadow-pixel) select-none',
        'enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] enabled:active:shadow-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...rest}
    />
  );
}
