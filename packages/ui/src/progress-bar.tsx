interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'accent' | 'green' | 'orange' | 'red';
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const COLORS = {
  primary: 'from-primary-500 to-primary-600',
  accent: 'from-accent-500 to-accent-600',
  green: 'from-green-400 to-green-500',
  orange: 'from-orange-400 to-orange-500',
  red: 'from-red-400 to-red-500',
};

export function ProgressBar({ value, max = 100, color = 'primary', size = 'md', showLabel, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`w-full ${className ?? ''}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-400">{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}>
        <div
          className={`h-full bg-gradient-to-r ${COLORS[color]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
