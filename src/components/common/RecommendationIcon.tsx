import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Calendar,
  BarChart3,
  ClipboardList,
  TrendingUp,
  FileEdit,
  Search,
  Check,
  Star,
} from 'lucide-react';

interface RecommendationIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export function RecommendationIcon({ iconName, className = '', size = 16 }: RecommendationIconProps) {
  const iconProps = { size, className };

  switch (iconName) {
    case 'AlertTriangle':
      return <AlertTriangle {...iconProps} />;
    case 'AlertCircle':
      return <AlertCircle {...iconProps} />;
    case 'Clock':
      return <Clock {...iconProps} />;
    case 'Calendar':
      return <Calendar {...iconProps} />;
    case 'BarChart3':
      return <BarChart3 {...iconProps} />;
    case 'ClipboardList':
      return <ClipboardList {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'FileEdit':
      return <FileEdit {...iconProps} />;
    case 'Search':
      return <Search {...iconProps} />;
    case 'Check':
      return <Check {...iconProps} />;
    case 'Star':
      return <Star {...iconProps} />;
    default:
      return <AlertCircle {...iconProps} />;
  }
}
