"use client";

import { useRouter, useSearchParams } from "next/navigation";
import PageControlButton from "./PageControlButton";

interface SpreadPaginationProps {
  currentPage: number;
  totalPages: number;
  /** Optional: override default URL navigation with a direct callback */
  onPrev?: () => void;
  /** Optional: override default URL navigation with a direct callback */
  onNext?: () => void;
}

export default function SpreadPagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: SpreadPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const SIDE_OFFSET = -64;

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-between">
      <div
        className="absolute pointer-events-auto"
        style={{ left: `${SIDE_OFFSET}px` }}
      >
        <PageControlButton
          direction="left"
          disabled={currentPage <= 1}
          onClick={() => (onPrev ? onPrev() : handlePageChange(currentPage - 1))}
          className="opacity-80 hover:opacity-100"
        />
      </div>
      <div
        className="absolute pointer-events-auto"
        style={{ right: `${SIDE_OFFSET}px` }}
      >
        <PageControlButton
          direction="right"
          disabled={currentPage >= totalPages}
          onClick={() => (onNext ? onNext() : handlePageChange(currentPage + 1))}
          className="opacity-80 hover:opacity-100"
        />
      </div>
    </div>
  );
}
