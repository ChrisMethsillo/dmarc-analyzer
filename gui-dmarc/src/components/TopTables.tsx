import { useEffect, useState } from 'react'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { LocalTable } from './TableElements'
import { DmarcReportsTable } from './ReportsTables'
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react'

type DomainData = {
  domain: string
  count: number
}

function DomainReportTable({ domain, name, reports = [], open, setOpen }) {
  const [data, setData] = useState([])

  useEffect(() => {
    if (!name) {
      return
    }

    const newData = reports.filter((report) => {
      let found = false
      report.record.forEach((row) => {
        if (!row.identifiers[name] && domain === 'null') {
          found = true
        }
        if (row?.identifiers?.[name] === domain) {
          found = true
        }
      })
      return found
    })

    setData(newData)
  }, [domain, name, reports])

  if (!open || !domain) {
    return null
  }

  return (
    <Dialog
      open={open}
      handler={() => setOpen(false)}
      size="xl"
      className="bg-blue-gray-900 text-white"
    >
      <DialogHeader className="text-white">
        Related reports: {domain}
      </DialogHeader>
      <DialogBody className="flex items-center justify-center min-h-[60vh]">
        {' '}
        {/* Ajuste para centrar */}
        <DmarcReportsTable reportsData={data} pageSize={5} />
      </DialogBody>
      <DialogFooter>
        <Button
          variant="solid"
          color="blue-gray"
          onClick={() => setOpen(false)}
        >
          <span>Close</span>
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export function TopDomainTable({ domainData, name, reports = [] }) {
  const columns = React.useMemo<ColumnDef<DomainData>[]>(
    () => [
      {
        header: 'Domain',
        accessorKey: 'domain',
      },
      {
        header: 'Count',
        accessorKey: 'count',
      },
    ],
    [],
  )

  const [data, setData] = React.useState<DomainData[]>([])
  const [selectedDomain, setSelectedDomain] = React.useState<string | null>(
    null,
  )
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    if (!domainData) {
      return
    }
    const newData: DomainData[] = Object.entries(domainData).map(
      ([key, value]) => ({
        domain: key,
        count: value as number,
      }),
    )
    // Sort by count
    newData.sort((a, b) => b.count - a.count)

    setData(newData)
  }, [domainData])

  return (
    <>
      <LocalTable
        data={data}
        columns={columns}
        name={''}
        onClick={(row) => {
          setSelectedDomain(row.getValue('domain'))
          setOpen(true)
        }}
      />
      <DomainReportTable
        domain={selectedDomain}
        name={name}
        reports={reports}
        open={open}
        setOpen={setOpen}
      />
    </>
  )
}
