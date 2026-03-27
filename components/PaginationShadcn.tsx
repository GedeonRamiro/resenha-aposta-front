"use client";

import { getPaginationRange } from "@/utils/getPagination";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "./ui/pagination";

import { GrFormNext, GrFormPrevious } from "react-icons/gr";

type PaginationProps = {
  count: number | undefined;
  currentPage: number | undefined;
  nextPage: number | undefined | null;
  lastPage: number | undefined | null;
  prevPage: number | undefined | null;
};

export default function PaginationShadcn({
  currentPage,
  lastPage,
  nextPage,
  prevPage,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function handleChangePage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  const current = currentPage ?? 1;
  const total = lastPage ?? 1;
  const paginationRange = getPaginationRange(current, total);

  return (
    <Pagination>
      <PaginationContent>
        {total > 1 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => prevPage && handleChangePage(prevPage)}
              aria-disabled={!prevPage}
              className={
                !prevPage ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            >
              <GrFormPrevious size={20} />
            </PaginationLink>
          </PaginationItem>
        )}

        {paginationRange.map((item, index) => {
          if (item === "...") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          const pageNumber = item as number;
          const isActive = pageNumber === current;

          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                isActive={isActive}
                onClick={() => handleChangePage(pageNumber)}
                className={isActive ? "pointer-events-none" : "cursor-pointer"}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {total > 1 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => nextPage && handleChangePage(nextPage)}
              aria-disabled={!nextPage}
              className={
                !nextPage ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            >
              <GrFormNext size={20} />
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
