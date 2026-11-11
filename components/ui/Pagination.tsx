import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageSize, totalItems, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle px-5 py-3">
      <p className="text-sm text-secondary">
        Showing <span className="font-medium text-primary">{rangeStart}–{rangeEnd}</span> of{" "}
        <span className="font-medium text-primary">{totalItems}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm text-secondary">
          Page <span className="font-medium text-primary">{page}</span> of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
