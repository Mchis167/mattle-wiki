"use client";

import { useRouter, useSearchParams } from "next/navigation";
import PageControlButton from "./PageControlButton";

interface SpreadPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function SpreadPagination({
  currentPage,
  totalPages,
}: SpreadPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const SIDE_OFFSET = -64; // Tránh magic numbers, dễ dàng điều chỉnh tại đây

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-between">
      <div
        className="absolute pointer-events-auto"
        style={{ left: `${SIDE_OFFSET}px` }}
      >
        <PageControlButton
          direction="left"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
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
          onClick={() => handlePageChange(currentPage + 1)}
          className="opacity-80 hover:opacity-100"
        />
      </div>
    </div>
  );
}
