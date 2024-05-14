import React, { useEffect } from 'react';
import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'

type PolicyPublished = {
  domain: string;
  adkim: string;
  aspf: string;
  p: string;
  sp: string;
  pct: number;
  fo: number;
};

type PolicyEvaluated = {
  disposition: string;
  dkim: string | null;
  spf: string;
};

type AuthResults = {
  spf: {
    domain: string;
    scope: string;
    result: string;
  };
  dkim: {
    domain: string;
    selector: string;
    result: string | null;
  } | null;
};

type RecordRow = {
  source_ip: string;
  count: number;
  policy_evaluated: PolicyEvaluated;
};

type RecordIdentifiers = {
  envelope_to: string;
  envelope_from: string;
  header_from: string;
};

type DmarcRecord = {
  row: RecordRow;
  identifiers: RecordIdentifiers;
  auth_results: AuthResults;
};

type DmarcReport = {
  _id: string;
  version: string;
  org_name: string;
  report_id: string;
  email: string;
  date_begin: string;
  date_end: string;
  policy_published: PolicyPublished | null;
  record: DmarcRecord[];
};

export function DmarcReportsTable({ reportsData }: { reportsData: DmarcReport[] }) {
  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<DmarcReport>[]>(
    () => [
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Organization Name',
        accessorKey: 'org_name',
      },
      {
        header: 'Date Begin',
        accessorKey: 'date_begin',
        cell: (row) => {
          const date = new Date(row.getValue());
          return date.toLocaleDateString();
        },
      },
      {
        header: 'Date End',
        accessorKey: 'date_end',
        cell: (row) => {
          const date = new Date(row.getValue());
          return date.toLocaleDateString();
        },
      },
      {
        header: 'Records',
        accessorKey: 'record',
        cell: (row) => row.getValue().length,
      },
      {
        header: 'Auth Results DKIM percentage',
        accessorKey: 'record',
        cell: (row) => {
          const records = row.getValue();
          const dkimPass = records.filter(
            (record) => record.auth_results.dkim?.result === 'pass'
          ).length;
          const dkimFail = records.filter(
            (record) => record.auth_results.dkim?.result === 'fail'
          ).length;
          const total = records.length;
          return `pass: ${((dkimPass / total) * 100).toFixed(2)}%, fail: ${((dkimFail / total) * 100).toFixed(2)}%`;
        },

      },
      {
        header: 'Auth Results SPF percentage',
        accessorKey: 'record',
        cell: (row) => {
          const records = row.getValue();
          const spfPass = records.filter(
            (record) => record.auth_results.spf.result === 'pass'
          ).length;
          const spfFail = records.filter(
            (record) => record.auth_results.spf.result === 'fail'
          ).length;
          const total = records.length;
          return `pass: ${((spfPass / total) * 100).toFixed(2)}%, fail: ${((spfFail / total) * 100).toFixed(2)}%`;
        },
      }
    ],
    []
  );

  const [data, setData] = React.useState<DmarcReport[]>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  useEffect(() => {
    setData(reportsData);
    console.log(table.getRowModel().rows[0])
  }
  , [reportsData]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className='flex flex-col overflow-x-auto'>
      <div className="flex flex-col pt-6 overflow-auto">
        <table className="flex-col divide-y divide-gray-200 bg-gray-800 text-white overflow-auto">
          <thead className="flex-grow bg-gray-700 ">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="h-2" />
        <div className="flex items-center gap-2 mt-4">
          <button
            className="border rounded p-1 text-gray-700 bg-gray-200"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="border rounded p-1 text-gray-700 bg-gray-200"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className="border rounded p-1 text-gray-700 bg-gray-200"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="border rounded p-1 text-gray-700 bg-gray-200"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
          <span className="flex items-center gap-1 text-gray-200">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1 text-gray-200">
            | Go to page:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-16 text-gray-700"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="border p-1 rounded text-gray-700 bg-gray-200"
          >
            {[5, 10, 15, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="text-gray-200 mt-2">
          {table.getRowModel().rows.length} Rows
        </div>

    </div>
  );
}
   
export function RecordsTable({ recordsData }: { recordsData: DmarcRecord[] }) {
  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<DmarcRecord>[]>(
    () => [
      {
        header: 'Source IP',
        accessorKey: 'row',
        cell: (row) => row.getValue().source_ip,
      },
      {
        header: 'Count',
        accessorKey: 'row',
        cell: (row) => row.getValue().count,
      },
      {
        header: 'Disposition',
        accessorKey: 'row',
        cell: (row) => row.getValue().policy_evaluated?.disposition,
      },
      {
        header: 'DKIM',
        accessorKey: 'row',
        cell: (row) => row.getValue().policy_evaluated?.dkim,
      },
      {
        header: 'SPF',
        accessorKey: 'row',
        cell: (row) => row.getValue().policy_evaluated?.spf,
      },
      {
        header: 'Envelope To',
        accessorKey: 'identifiers',
        cell: (row) => row.getValue().envelope_to,
      },
      {
        header: 'Envelope From',
        accessorKey: 'identifiers',
        cell: (row) => row.getValue().envelope_from,
      },
      {
        header: 'Header From',
        accessorKey: 'identifiers',
        cell: (row) => row.getValue().header_from,
      },
      {
        header: 'SPF Domain',
        accessorKey: 'auth_results',
        cell: (row) => row.getValue().spf.domain,
      },
      {
        header: 'SPF Scope',
        accessorKey: 'auth_results',
        cell: (row) => row.getValue().spf?.scope,
      },
      {
        header: 'SPF Result',
        accessorKey: 'auth_results',
        cell: (row) => row.getValue().spf?.result,
      },
      {
        header: 'DKIM Domain',
        accessorKey: 'auth_results',
        cell: (row) => row.getValue().dkim?.domain,
      },
      {
        header: 'DKIM Selector',
        accessorKey: 'auth_results',
        cell: (row) => row.getValue().dkim?.selector,
      },
      {
        header: 'DKIM Result',
        accessorKey: 'auth_results',
        cell: (row) => row.getValue().dkim?.result,
      },
    ],
    []
  );

  const [data, setData] = React.useState<DmarcRecord[]>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  useEffect(() => {
    setData(recordsData);
  }, [recordsData]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className='flex flex-col overflow-x-auto'>
      <div className="rounded-xl shadow-xl flex flex-col overflow-auto">
        <table className="flex-col divide-y divide-gray-200 bg-gray-800 text-white overflow-auto">
          <thead className="flex-grow bg-gray-700 ">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="h-2" />
        <div className="flex items-center gap-2 mt-4">
          <button
            className="border rounded p-1 text-gray-700 bg-gray-200"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="border rounded p-1 text-gray-700 bg-gray-200"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className="border rounded p-1 text-gray-700 bg-gray-200"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="border rounded p-1 text-gray-700 bg-gray-200"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
          <span className="flex items-center gap-1 text-gray-200">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1 text-gray-200">
            | Go to page:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-16 text-gray-700"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="border p-1 rounded text-gray-700 bg-gray-200"
          >
            {[5, 10, 15, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="text-gray-200 mt-2">
          {table.getRowModel().rows.length} Rows
        </div>

    </div>
  );
 
}




 