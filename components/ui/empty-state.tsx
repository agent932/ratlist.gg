import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  /**
   * Icon to display (Lucide React component or null)
   */
  icon?: React.ReactNode;
  /**
   * Title text
   */
  title: string;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Optional action button
   */
  action?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Reusable empty state component for consistent UX
 * Used across dashboard sections, tables, and lists
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <Card className={`p-8 text-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          {description && (
            <p className="text-sm text-white/60">{description}</p>
          )}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </Card>
  );
}
