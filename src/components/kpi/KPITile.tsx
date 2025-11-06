import { ReactNode } from 'react';
import { getThresholdClasses } from '../../utils/thresholds';

type ThresholdLevel = 'green' | 'yellow' | 'red';

interface KPITileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  thresholdLevel?: ThresholdLevel;
  sparkline?: ReactNode;
  icon?: ReactNode;
  tooltip?: string;
  onClick?: () => void;
}

export function KPITile({
  title,
  value,
  subtitle,
  thresholdLevel,
  sparkline,
  icon,
  tooltip,
  onClick,
}: KPITileProps) {
  const classes = thresholdLevel ? getThresholdClasses(thresholdLevel) : null;

  return (
    <div
      className={`
        relative p-6 rounded-lg border-2 transition-all
        ${classes ? `${classes.bg} ${classes.border}` : 'bg-white border-gray-200'}
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
      `}
      onClick={onClick}
      title={tooltip}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={`text-sm font-medium ${classes ? classes.text : 'text-gray-600'}`}>
          {title}
        </h3>
        {icon && <div className={classes ? classes.text : 'text-gray-400'}>{icon}</div>}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className={`text-3xl font-bold ${classes ? classes.text : 'text-gray-900'}`}>
            {value}
          </div>
          {subtitle && (
            <div className={`text-xs mt-1 ${classes ? classes.text : 'text-gray-500'}`}>
              {subtitle}
            </div>
          )}
        </div>

        {sparkline && (
          <div className="ml-4 h-12 flex items-end">
            {sparkline}
          </div>
        )}
      </div>

      {thresholdLevel && (
        <div className="absolute top-2 right-2">
          <div
            className={`w-3 h-3 rounded-full ${
              thresholdLevel === 'green'
                ? 'bg-emerald-500'
                : thresholdLevel === 'yellow'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            title={`Status: ${thresholdLevel}`}
          />
        </div>
      )}
    </div>
  );
}
