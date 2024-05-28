import { useEffect } from 'react'
import React from 'react'
import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { LocalTable } from './TableElements'
import { useNavigate } from 'react-router-dom'

type PolicyPublished = {
  domain: string
  adkim: string
  aspf: string
  p: string
  sp: string
  pct: number
  fo: number
}

type PolicyEvaluated = {
  disposition: string
  dkim: string | null
  spf: string
}

type AuthResults = {
  spf: {
    domain: string
    scope: string
    result: string
  }
  dkim: {
    domain: string
    selector: string
    result: string | null
  } | null
}

type RecordRow = {
  source_ip: string
  count: number
  policy_evaluated: PolicyEvaluated
}

type RecordIdentifiers = {
  envelope_to: string
  envelope_from: string
  header_from: string
}

type DmarcRecord = {
  row: RecordRow
  identifiers: RecordIdentifiers
  auth_results: AuthResults
}

type DmarcReport = {
  _id: string
  version: string
  org_name: string
  report_id: string
  email: string
  date_begin: string
  date_end: string
  policy_published: PolicyPublished | null
  record: DmarcRecord[]
}

export function DmarcReportsTable({
  reportsData,
}: {
  reportsData: DmarcReport[]
}) {
  const rerender = React.useReducer(() => ({}), {})[1]
  const navigate = useNavigate()

  const handleRowClick = (id: string) => {
    navigate(`/report/${id}`)
  }

  const columns = React.useMemo<ColumnDef<DmarcReport>[]>(
    () => [
      {
        header: 'Report',
        accessorKey: 'report_id',
        cell: (row: any) => {
          const value = row.getValue()
          return (
            <button
              className="text-blue-500 w-40 break-words overflow-hidden"
              onClick={() => handleRowClick(value)}
              style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}
            >
              {value}
            </button>
          )
        },
      },

      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Reporter',
        accessorKey: 'org_name',
      },
      {
        header: 'Begin Date',
        accessorFn: (row) => new Date(row.date_begin),
        cell: (row: any) => {
          const date = row.getValue()
          return date.toDateString()
        },
      },
      {
        header: 'End Date',
        accessorFn: (row) => new Date(row.date_end),
        cell: (row: any) => {
          const date = row.getValue()
          return date.toDateString()
        },
      },
      {
        header: 'Total Emails',
        accessorFn: (row) => row.record.reduce((a, b) => a + b.row.count, 0),
      },
      {
        header: 'SPF Pass',
        accessorFn: (row) =>
          row.record.reduce(
            (a, b) =>
              a + (b.row?.policy_evaluated?.spf === 'pass' ? b.row.count : 0),
            0,
          ),
      },
      {
        header: 'SPF Fail',
        accessorFn: (row) =>
          row.record.reduce(
            (a, b) =>
              a + (b.row?.policy_evaluated?.spf !== 'pass' ? b.row.count : 0),
            0,
          ),
      },
      {
        header: 'DKIM Pass',
        accessorFn: (row) =>
          row.record.reduce(
            (a, b) =>
              a + (b.row?.policy_evaluated?.dkim === 'pass' ? b.row.count : 0),
            0,
          ),
      },
      {
        header: 'DKIM Fail',
        accessorFn: (row) =>
          row.record.reduce(
            (a, b) =>
              a + (b.row?.policy_evaluated?.dkim !== 'pass' ? b.row.count : 0),
            0,
          ),
      },
      {
        header: 'Policy: None',
        accessorFn: (row) =>
          row.record.reduce(
            (a, b) =>
              a +
              (b.row?.policy_evaluated?.disposition === 'none'
                ? b.row.count
                : 0),
            0,
          ),
      },
      {
        header: 'Policy: Quarantine',
        accessorFn: (row) =>
          row.record.reduce(
            (a, b) =>
              a +
              (b.row?.policy_evaluated?.disposition === 'quarantine'
                ? b.row.count
                : 0),
            0,
          ),
      },
      {
        header: 'Policy: Reject',
        accessorFn: (row) =>
          row.record.reduce(
            (a, b) =>
              a +
              (b.row?.policy_evaluated?.disposition === 'reject'
                ? b.row.count
                : 0),
            0,
          ),
      },
    ],
    [],
  )

  return (
    <div className="flex w-screen px-10 overflow-x-auto">
      <LocalTable data={reportsData} columns={columns} name={'DMARC Reports'} />
    </div>
  )
}

export function RecordsTable({ recordsData }: { recordsData: DmarcRecord[] }) {
  const rerender = React.useReducer(() => ({}), {})[1]

  const columns = React.useMemo<ColumnDef<DmarcRecord>[]>(
    () => [
      {
        header: 'Source IP',
        accessorFn: (record) => record.row?.source_ip,
      },
      {
        header: 'Number of Emails',
        accessorFn: (record) => record.row?.count,
      },
      {
        header: 'DMARC Disposition',
        accessorFn: (record) => record.row?.policy_evaluated?.disposition,
      },
      {
        header: 'DKIM Policy Evaluated',
        accessorFn: (record) => record.row?.policy_evaluated?.dkim,
      },
      {
        header: 'SPF Policy Evaluated',
        accessorFn: (record) => record.row?.policy_evaluated?.spf,
      },
      {
        header: 'Envelope To',
        accessorFn: (record) => record.identifiers?.envelope_to,
      },
      {
        header: 'Envelope From',
        accessorFn: (record) => record.identifiers?.envelope_from,
      },
      {
        header: 'Header From',
        accessorFn: (record) => record.identifiers?.header_from,
      },
      {
        header: 'SPF Auth Domain',
        accessorFn: (record) => record.auth_results?.spf?.domain,
      },
      {
        header: 'SPF Auth Scope',
        accessorFn: (record) => record.auth_results?.spf?.scope,
      },
      {
        header: 'SPF Auth Result',
        accessorFn: (record) => record.auth_results?.spf?.result,
      },
      {
        header: 'DKIM Auth Domain',
        accessorFn: (record) => record.auth_results?.dkim?.domain,
      },
      {
        header: 'DKIM Auth Selector',
        accessorFn: (record) => record.auth_results?.dkim?.selector,
      },
      {
        header: 'DKIM Auth Result',
        accessorFn: (record) => record.auth_results?.dkim?.result,
      },
    ],
    [],
  )

  const [data, setData] = React.useState<DmarcRecord[]>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })

  useEffect(() => {
    setData(recordsData)
  }, [recordsData])

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex w-full overflow-x-auto">
      <LocalTable data={data} columns={columns} name={'Records'} />
    </div>
  )
}
