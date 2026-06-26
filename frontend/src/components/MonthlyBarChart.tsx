import { rupiahCompact } from '@/lib/format';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

// Koordinat dalam satuan viewBox (responsif via preserveAspectRatio).
const COL_W = 32;
const BAR_W = 18;
const CHART_H = 150;
const TOP = 16;
const LABEL_H = 22;
const WIDTH = COL_W * 12;
const HEIGHT = TOP + CHART_H + LABEL_H;

interface MonthlyBarChartProps {
  /** 12 nilai (Jan..Des) dalam IDR. */
  values: number[];
  /** Index bulan terpilih (0-11) untuk disorot. */
  selected: number;
  onSelect: (month: number) => void;
  /** Kelas warna fill Tailwind, mis. 'fill-indigo-500'. */
  colorClass?: string;
}

/** Bar chart bulanan sederhana berbasis SVG — tanpa dependensi eksternal. */
export function MonthlyBarChart({
  values,
  selected,
  onSelect,
  colorClass = 'fill-indigo-500',
}: MonthlyBarChartProps) {
  const max = Math.max(...values, 1);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      class="h-56 w-full"
      role="img"
      aria-label="Grafik bulanan"
    >
      {/* Garis dasar */}
      <line
        x1="0"
        y1={TOP + CHART_H}
        x2={WIDTH}
        y2={TOP + CHART_H}
        class="stroke-line"
        stroke-width="1"
      />
      {values.map((v, i) => {
        const h = max > 0 ? (v / max) * CHART_H : 0;
        const x = i * COL_W + (COL_W - BAR_W) / 2;
        const y = TOP + (CHART_H - h);
        const isSel = i === selected;
        return (
          <g
            key={i}
            class="cursor-pointer"
            onClick={() => onSelect(i)}
          >
            {/* Area klik penuh tinggi kolom */}
            <rect x={i * COL_W} y={TOP} width={COL_W} height={CHART_H} fill="transparent" />
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={Math.max(h, 1)}
              rx="3"
              class={colorClass}
              opacity={isSel ? 1 : 0.45}
            />
            {isSel && v > 0 && (
              <text
                x={i * COL_W + COL_W / 2}
                y={y - 4}
                text-anchor="middle"
                class="fill-ink text-[9px] font-semibold"
              >
                {rupiahCompact(v)}
              </text>
            )}
            <text
              x={i * COL_W + COL_W / 2}
              y={TOP + CHART_H + 15}
              text-anchor="middle"
              class={`text-[10px] ${isSel ? 'fill-ink font-semibold' : 'fill-muted'}`}
            >
              {MONTHS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export { MONTHS };
