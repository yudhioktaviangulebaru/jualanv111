import {
  RiShoppingBag3Line,
  RiPriceTag3Line,
  RiStore2Line,
  RiCoinLine,
  RiBox3Line,
  RiShoppingCartLine,
  RiBarChartBoxLine,
  RiWallet3Line,
  RiTruckLine,
  RiStarSmileLine,
} from '@remixicon/react';
import type { RemixIcon } from '@/config/nav';

interface Doodle {
  icon: RemixIcon;
  top: string;
  left: string;
  size: number;
  rotate: number;
}

// Ikon bertema jualan, tersebar acak sebagai dekorasi latar.
const DOODLES: Doodle[] = [
  { icon: RiShoppingBag3Line, top: '8%', left: '6%', size: 64, rotate: -12 },
  { icon: RiPriceTag3Line, top: '18%', left: '82%', size: 52, rotate: 14 },
  { icon: RiStore2Line, top: '70%', left: '10%', size: 72, rotate: 8 },
  { icon: RiCoinLine, top: '80%', left: '78%', size: 56, rotate: -10 },
  { icon: RiBox3Line, top: '40%', left: '90%', size: 44, rotate: 18 },
  { icon: RiShoppingCartLine, top: '52%', left: '4%', size: 60, rotate: -6 },
  { icon: RiBarChartBoxLine, top: '12%', left: '46%', size: 40, rotate: 10 },
  { icon: RiWallet3Line, top: '86%', left: '40%', size: 48, rotate: -14 },
  { icon: RiTruckLine, top: '32%', left: '20%', size: 50, rotate: 6 },
  { icon: RiStarSmileLine, top: '60%', left: '60%', size: 38, rotate: -8 },
];

export function LoginDoodle() {
  return (
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Blob gradien lembut untuk kedalaman. */}
      <div class="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div class="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl" />

      {/* Ikon doodle tersebar. */}
      {DOODLES.map(({ icon: Icon, top, left, size, rotate }, i) => (
        <Icon
          key={i}
          size={size}
          className="absolute text-ink/[0.05] dark:text-white/[0.06]"
          style={{
            top,
            left,
            transform: `rotate(${rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
