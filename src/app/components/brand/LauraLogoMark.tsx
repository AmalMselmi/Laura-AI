import type { HTMLAttributes } from 'react';
import { cn } from '../ui/utils';

const LOGO_SRC = '/logo.svg';

const SIZE_PRESETS = {
  /** Headers: pricing, shared doc, docs, API hero row */
  xs: {
    box: 'h-8 w-8 min-h-8 min-w-8',
    round: 'rounded-lg',
    pad: 'p-1.5',
    img: 'h-[18px] w-auto max-w-[90%] object-contain',
  },
  /** Sidebars (patient / radiologist / admin) */
  md: {
    box: 'h-10 w-10 min-h-10 min-w-10',
    round: 'rounded-[14px]',
    pad: 'p-2',
    img: 'h-[26px] w-auto max-w-[90%] object-contain',
  },
  /** Contact page back row */
  contact: {
    box: 'h-7 w-7 min-h-7 min-w-7',
    round: 'rounded-lg',
    pad: 'p-1',
    img: 'h-[17px] w-auto max-w-[90%] object-contain',
  },
  /** Login hero */
  lg: {
    box: 'h-16 w-16 min-h-16 min-w-16 sm:h-20 sm:w-20 sm:min-h-20 sm:min-w-20',
    round: 'rounded-2xl',
    pad: 'p-3 sm:p-4',
    img: 'h-[44%] sm:h-[46%] w-auto max-w-[88%] object-contain',
  },
  /** Sign-up title row */
  signup: {
    box: 'h-10 w-10 min-h-10 min-w-10 sm:h-12 sm:w-12 sm:min-h-12 sm:min-w-12',
    round: 'rounded-xl',
    pad: 'p-2 sm:p-2.5',
    img: 'h-[60%] sm:h-[58%] w-auto max-w-[88%] object-contain',
  },
  /** About page header */
  hero: {
    box: 'h-10 w-10 min-h-10 min-w-10',
    round: 'rounded-xl',
    pad: 'p-2',
    img: 'h-[26px] w-auto max-w-[90%] object-contain',
  },
} as const;

const TONE_CLASS = {
  brand: 'bg-gradient-to-br from-[#155dfc] to-[#ff2056]',
  admin: 'bg-gradient-to-br from-blue-600 to-purple-600',
  radiologist: 'bg-gradient-to-br from-[#155dfc] to-[#9810fa]',
  /** White mark on translucent panel (e.g. API doc hero) */
  onDark: 'bg-white/20 ring-1 ring-white/25',
} as const;

export type LauraLogoMarkSize = keyof typeof SIZE_PRESETS;
export type LauraLogoMarkTone = keyof typeof TONE_CLASS;

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  size?: LauraLogoMarkSize;
  tone?: LauraLogoMarkTone;
};

/**
 * Laura brand mark from `/logo.svg` (white paths) on a gradient or glass panel.
 */
export function LauraLogoMark({ size = 'md', tone = 'brand', className, ...rest }: Props) {
  const preset = SIZE_PRESETS[size];
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        preset.box,
        preset.round,
        preset.pad,
        TONE_CLASS[tone],
        className,
      )}
      {...rest}
    >
      <img src={LOGO_SRC} alt="" className={preset.img} decoding="async" />
    </div>
  );
}
