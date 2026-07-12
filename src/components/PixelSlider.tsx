import type { InputHTMLAttributes } from 'react';

interface PixelSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

export function PixelSlider({ value, onChange, className = '', ...rest }: PixelSliderProps) {
  return (
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(e.currentTarget.valueAsNumber)}
      className={['pixel-slider', className].join(' ')}
      {...rest}
    />
  );
}
