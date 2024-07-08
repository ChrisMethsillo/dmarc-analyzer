import { useEffect } from 'react'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { LocalTable } from './TableElements'

type DomainData = {
  domain: string
  count: number
}

export function TopDomainTable({ domainData, name }) {
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

  return <LocalTable data={data} columns={columns} name={''} />
}
