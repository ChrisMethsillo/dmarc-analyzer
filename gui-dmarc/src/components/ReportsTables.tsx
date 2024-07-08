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
import { LocalTable, LocalSimpleTable } from './TableElements'
import { useNavigate } from 'react-router-dom'

type DateRangeType = {
  begin: string // Using string to represent datetime in ISO format
  end: string
}

type ReportMetadataType = {
  org_name: string
  email: string
  extra_contact_info?: string | null
  report_id: string
  date_range: DateRangeType
  error?: string[] | null
}

type PolicyOverrideReason = {
  type: string
  comment?: string | null
}

type PolicyEvaluatedType = {
  disposition: string
  dkim: string
  spf: string
  reason?: PolicyOverrideReason | PolicyOverrideReason[] | null
}

type RowType = {
  source_ip: string
  count: number
  policy_evaluated: PolicyEvaluatedType
}

type IdentifierType = {
  envelope_to?: string | null
  envelope_from?: string | null
  header_from?: string | null
}

type DKIMAuthResultType = {
  domain: string
  selector?: string | null
  result: string
  human_result?: string | null
}

type SPFAuthResultType = {
  domain: string
  scope?: string | null
  result: string
}

type AuthResultType = {
  dkim?: DKIMAuthResultType[] | null
  spf?: SPFAuthResultType[] | null
}

type RecordType = {
  row: RowType
  identifiers: IdentifierType
  auth_results: AuthResultType
}

type PolicyPublishedType = {
  domain: string
  adkim?: string | null
  aspf?: string | null
  p?: string | null
  sp?: string | null
  pct?: number | null
  fo?: string | null
}

type DmarcReport = {
  _id: string
  version?: string | null
  report_metadata: ReportMetadataType
  policy_published: PolicyPublishedType | null
  record: RecordType[] | RecordType
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
        accessorKey: 'report_metadata.report_id',
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
        header: 'Reporter',
        accessorKey: 'report_metadata.org_name',
      },
      {
        header: 'Email',
        accessorKey: 'report_metadata.email',
      },
      {
        header: 'Begin Date',
        accessorFn: (report) =>
          new Date(
            report?.report_metadata?.date_range.begin,
          ).toLocaleDateString(),
      },
      {
        header: 'End Date',
        accessorFn: (report) =>
          new Date(
            report?.report_metadata?.date_range.end,
          ).toLocaleDateString(),
      },
      {
        header: 'Total Records',
        accessorFn: (report) => {
          const records = Array.isArray(report.record)
            ? report.record
            : [report.record]
          return records.length
        },
      },
      {
        header: 'Total Emails',
        accessorFn: (row) => {
          const records = Array.isArray(row.record) ? row.record : [row.record]
          return records.reduce((a, b) => a + b.row.count, 0)
        },
      },
      {
        header: 'SPF Pass',
        accessorFn: (row) =>
          (Array.isArray(row.record) ? row.record : [row.record]).reduce(
            (a, b) =>
              a + (b.row?.policy_evaluated?.spf === 'pass' ? b.row.count : 0),
            0,
          ),
      },
      {
        header: 'SPF Fail',
        accessorFn: (row) =>
          (Array.isArray(row.record) ? row.record : [row.record]).reduce(
            (a, b) =>
              a + (b.row?.policy_evaluated?.spf !== 'pass' ? b.row.count : 0),
            0,
          ),
      },
      {
        header: 'DKIM Pass',
        accessorFn: (row) =>
          (Array.isArray(row.record) ? row.record : [row.record]).reduce(
            (a, b) =>
              a + (b.row?.policy_evaluated?.dkim === 'pass' ? b.row.count : 0),
            0,
          ),
      },
      {
        header: 'DKIM Fail',
        accessorFn: (row) =>
          (Array.isArray(row.record) ? row.record : [row.record]).reduce(
            (a, b) =>
              a + (b.row?.policy_evaluated?.dkim !== 'pass' ? b.row.count : 0),
            0,
          ),
      },
      {
        header: 'Policy: None',
        accessorFn: (row) =>
          (Array.isArray(row.record) ? row.record : [row.record]).reduce(
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
          ([] as RecordType[])
            .concat(row.record)
            .reduce(
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
          ([] as RecordType[])
            .concat(row.record)
            .reduce(
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
    <div className="flex w-[90%] overflow-x-auto">
      <LocalSimpleTable
        data={reportsData}
        columns={columns}
        name={'DMARC Reports'}
        pageSize={10}
      />
    </div>
  )
}

export function RecordsTable({ recordsData }: { recordsData: RecordType[] }) {
  const rerender = React.useReducer(() => ({}), {})[1]

  const columns = React.useMemo<ColumnDef<RecordType>[]>(
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
        accessorFn: (record) => {
          if (record.auth_results?.spf && Array.isArray(record.auth_results.spf)) {
            return record.auth_results.spf.map((result) => result.domain).join(', ');
          }
          return '';
        }
      },
      {
        header: 'SPF Auth Scope',
        accessorFn: (record) => {
          if (record.auth_results?.spf && Array.isArray(record.auth_results.spf)) {
            return record.auth_results.spf.map((result) => result.scope).join(', ');
          }
          return '';
        }
      },
      {
        header: 'SPF Auth Result',
        accessorFn: (record) => {
          if (record.auth_results?.spf && Array.isArray(record.auth_results.spf)) {
            return record.auth_results.spf.map((result) => result.result).join(', ');
          }
          return '';
        }
      },
      {
        header: 'DKIM Auth Domain',
        accessorFn: (record) => {
          if (record.auth_results?.dkim && Array.isArray(record.auth_results.dkim)) {
            return record.auth_results.dkim.map((result) => result.domain).join(', ');
          }
          return '';
        },
      },
      {
        header: 'DKIM Auth Selector',
        accessorFn: (record) => {
          if (record.auth_results?.dkim && Array.isArray(record.auth_results.dkim)) {
            return record.auth_results.dkim.map((result) => result.selector).join(', ');
          }
          return '';
        },
      },
      {
        header: 'DKIM Auth Result',
        accessorFn: (record) => {
          if (record.auth_results?.dkim && Array.isArray(record.auth_results.dkim)) {
            return record.auth_results.dkim.map((result) => result.result).join(', ');
          }
          return '';
        },
      },
    ],
    [],
  )

  const [data, setData] = React.useState<RecordType[]>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })

  useEffect(() => {
    setData(recordsData)
  }, [recordsData])

  return (
    <div className="flex w-full overflow-x-auto rounded-xl">
      <LocalTable data={data} columns={columns} name={'Records'} />
    </div>
  )
}
