import React from 'react'
import {
  Column,
  Table as ReactTable,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  PaginationState,
} from '@tanstack/react-table'

export function LocalTable({
  data,
  columns,
  name,
}: {
  data: any[]
  columns: ColumnDef<any>[]
  name: string
}) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  })

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex overflow-x-auto pb-3">
        <table className="min-w-full bg-gray-800 text-white divide-y divide-gray-200 rounded-xl">
          <thead className="bg-gray-800 text-gray-200 overflow-x-auto">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-3 pt-3 text-left text-md"
                  >
                    {!header.isPlaceholder && (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === 'asc'
                              ? 'Sort ascending'
                              : header.column.getNextSortingOrder() === 'desc'
                                ? 'Sort descending'
                                : 'Clear sort'
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
            <tr>
              {table.getHeaderGroups().map((headerGroup) => (
                <>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className=" px-3 pb-3 text-left text-sm"
                    >
                      {!header.isPlaceholder && (
                        <div className="flex-col w-full">
                          {header.column.getCanFilter() && (
                            <div className="text-white mt-2">
                              <Filter column={header.column} table={table} />
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-700 divide-y divide-gray-500">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-gray-700 hover:bg-gray-600">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="bg-gray-700 py-3 px-2 flex justify-between rounded-xl">
        <div className="flex gap-2 align-center items-center w-full ">
          <button
            className="rounded-xl px-5 text-gray-100 font-bold bg-gray-500"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="rounded-xl px-5 text-gray-100 font-bold bg-gray-500"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <div className="flex gap-1 text-gray-200">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </div>
          <button
            className="rounded-xl px-5 text-gray-100 font-bold bg-gray-500"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="rounded-xl px-5 text-gray-100 font-bold bg-gray-500"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>

        <div className="flex items-center gap-1 text-gray-200">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
            className="rounded-xl py-1 px-5 text-gray-100 font-bold bg-gray-500"
          >
            {[5, 10, 15, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export function Filter({
  column,
  table,
}: {
  column: Column<any, any>
  table: ReactTable<any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)
  const columnFilterValue = column.getFilterValue()

  return (
    <>
      {typeof firstValue === 'number' ? (
        <div className="flex space-x-2 items-center">
          <input
            type="number"
            value={(columnFilterValue as [number, number])?.[0] ?? ''}
            onChange={(e) =>
              column.setFilterValue((old: [number, number]) => [
                e.target.value,
                old?.[1],
              ])
            }
            placeholder={`Min`}
            className="w-20 px-2 py-1 text-gray-300 bg-gray-800 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
      ) : firstValue instanceof Date ||
        !isNaN(Date.parse(firstValue as string)) ? (
        <div></div>
      ) : (
        <input
          value={(columnFilterValue ?? '') as string}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={`Search...`}
          className="w-36 px-2 py-1 text-gray-300 bg-gray-800 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          aria-label="search"
        />
      )}
    </>
  )
}
