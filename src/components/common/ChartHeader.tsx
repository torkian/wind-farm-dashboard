import { InfoButton } from './InfoButton';

interface ChartHeaderProps {
  title: string;
  subtitle?: string;
  info?: {
    title: string;
    description: string;
    formula?: string;
    interpretation?: string;
    example?: string;
  };
}

export function ChartHeader({ title, subtitle, info }: ChartHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {info && <InfoButton {...info} />}
      </div>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}
