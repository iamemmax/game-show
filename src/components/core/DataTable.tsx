'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import * as React from 'react';

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core';
import { Spinner } from '@/icons/core';
import { cn } from '@/utils/classNames';
import { Loader2 } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  isFetching: boolean;
  isLoading: boolean;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  rows: TData[] | null | undefined;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  columnsVisibilityList?: {
    actions: boolean;
  };
  hasOuterPadding?: boolean;
  tableContainerClassName?: string;
  setSelectedRows?: React.Dispatch<React.SetStateAction<TData[] | undefined>>;
  setRestockPayload?: (submission: TData[]) => void;
  selectedRows?: TData[];
  hasCheckBox?: boolean;
  restockPayload?: TData[];
  emptyRestockCountRef?: { current: number };
}

export default function DataTable<TData, TValue>({
  columns,
  isFetching,
  isLoading,
  pageCount,
  pageIndex,
  pageSize,
  rows,
  setPagination,
  hasOuterPadding = true,
  tableContainerClassName,
  setSelectedRows,
  setRestockPayload,
  hasCheckBox,
  restockPayload,
  emptyRestockCountRef,
}: DataTableProps<TData, TValue>) {
  const defaultData = React.useMemo(() => [], []);

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: rows ?? defaultData,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      pagination,

      // columnVisibility: columnsVisibilityList,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const selectedItems = table.getSelectedRowModel().rows.map(item => {
    return item.original;
  });

  React.useEffect(() => {
    if (hasCheckBox) {
      setSelectedRows?.(selectedItems);
      setRestockPayload?.(selectedItems);
    }
    if (
      restockPayload?.length === 0 &&
      emptyRestockCountRef &&
      emptyRestockCountRef?.current >= 2
    ) {
      table.toggleAllRowsSelected(false);
      emptyRestockCountRef.current = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems.length, restockPayload?.length]);

  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-full opacity-0 transition-opacity',
          isFetching && !isLoading && 'opacity-100'
        )}
      >
        <div className="bg-main-solid/20 h-1 w-full overflow-hidden">
          <div className="h-full w-full origin-[0_50%] animate-indeterminate-progress rounded-full bg-main-solid "></div>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-full opacity-0 transition-opacity",
          isFetching && !isLoading && "opacity-100",
        )}
      >
        <div className="bg-[#ff00ff]/20 h-1 w-full overflow-hidden">
          <div className="h-full w-full origin-[0_50%] animate-pulse rounded-full bg-[#ff00ff]"></div>
        </div>
      </div>

      <div
        className={cn(
          "overflow-auto rounded-lg",
          hasOuterPadding && "p-3 md:p-6 md:pt-0 lg:pb-8",
          tableContainerClassName,
        )}
      >
        <Table>
          <TableHeader className="bg-[#341D44]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-[#ff00ff]/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-6 py-4 text-sm font-medium text-white/70">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                  className="border-b border-[#ff00ff]/10 hover:bg-[#2a1a35]/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center text-white" colSpan={columns.length}>
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#ff00ff] mr-2" />
                      <span>Loading episodes...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12">
                      <p className="text-white mb-4">No episodes found</p>
                      <Button className="bg-[#6f2da8] hover:bg-[#8a3ad3] text-white">Create First Episode</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {table.getRowModel().rows?.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Button variant="unstyled" className="bg-[#6f2da8] text-white w-8 h-8 p-0 hover:bg-[#8a3ad3]">
                {pageIndex + 1}
              </Button>
              <Button
                variant="unstyled"
                className="text-white hover:bg-[#6f2da8] w-8 h-8 p-0"
                disabled={pageIndex + 2 > pageCount}
              >
                {pageIndex + 2}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                className="border-[#ff00ff]/30 text-white hover:bg-[#ff00ff]/10"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                Previous
              </Button>
              <Button
                className="bg-[#6f2da8] hover:bg-[#8a3ad3] text-white"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}