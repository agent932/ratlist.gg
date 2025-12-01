import { Button } from '@/components/ui/button';

interface PaginationProps {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number;
  /**
   * Total number of items
   */
  totalItems: number;
  /**
   * Items per page
   */
  itemsPerPage: number;
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * Reusable pagination component
 * Used across dashboard sections for consistent navigation
 */
export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav 
      className="flex items-center justify-between border-t border-white/10 pt-4"
      role="navigation"
      aria-label="Pagination"
    >
      <div className="text-sm text-white/60" aria-live="polite" aria-atomic="true">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          aria-label={`Go to previous page (page ${currentPage - 1})`}
          aria-disabled={currentPage === 1 || loading}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1" role="list">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current
            const showPage =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;

            // Show ellipsis for gaps
            if (!showPage) {
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span 
                    key={page} 
                    className="px-2 text-white/40"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                disabled={loading}
                className={
                  page === currentPage
                    ? 'bg-brand text-white'
                    : 'border-white/20'
                }
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                role="listitem"
              >
                {page}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          aria-label={`Go to next page (page ${currentPage + 1})`}
          aria-disabled={currentPage === totalPages || loading}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
