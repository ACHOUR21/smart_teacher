import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  total: number;
  pageSize: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  page: number;
  totalPages: number;
  canNext: boolean;
  canPrev: boolean;
  goTo: (page: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
}

export function usePagination({
  total,
  pageSize,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const canNext = page < totalPages;
  const canPrev = page > 1;

  const goTo = useCallback(
    (targetPage: number) => {
      setPage(Math.min(Math.max(1, targetPage), totalPages));
    },
    [totalPages]
  );

  const next = useCallback(() => setPage((p) => Math.min(p + 1, totalPages)), [totalPages]);
  const prev = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);
  const reset = useCallback(() => setPage(initialPage), [initialPage]);

  return { page, totalPages, canNext, canPrev, goTo, next, prev, reset };
}
