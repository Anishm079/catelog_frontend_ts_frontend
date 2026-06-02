import React from 'react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from '@mui/material'

export type Column<T> = {
  id: string
  label: string
  render: (row: T, index: number) => React.ReactNode
  /** CSS-in-JS object or tailwind class string */
  cellStyle?: React.CSSProperties | string
  align?: 'left' | 'right' | 'center' | 'inherit' | 'justify'
  width?: number | string
}

export type CustomTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  /** key of row object to use as React key, or a function that returns a key */
  rowKey?: keyof T | ((row: T, index: number) => string)
  emptyMessage?: string
  stickyHeader?: boolean
  className?: string
}

function getRowKey<T>(
  rowKey: CustomTableProps<T>['rowKey'],
  row: T,
  index: number,
) {
  if (!rowKey) return String(index)
  if (typeof rowKey === 'function') return rowKey(row, index)
  return String((row as any)[rowKey])
}

/**
 * CustomTable
 * - Uses MUI Table under the hood and accepts Tailwind classes in `cellStyle` as strings
 *
 * Example:
 * const columns = [
 *   { id: 'name', label: 'Name', render: r => r.name },
 *   { id: 'actions', label: 'Actions', render: r => <button>Open</button> , cellStyle: 'text-right'},
 * ]
 * <CustomTable columns={columns} data={rows} rowKey="id" />
 */
const CustomTable = <T,>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No data',
  stickyHeader = false,
  className = '',
}: CustomTableProps<T>) => {
  return (
    <TableContainer component={Paper} className={`bg-transparent ${className}`}>
      <Table size="small" stickyHeader={stickyHeader} className="min-w-full">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || 'left'}
                style={{ width: col.width }}
                className="font-medium text-slate-300 bg-slate-900/50"
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-8 text-center text-slate-400">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={getRowKey(rowKey, row, rowIndex)} hover className="even:bg-slate-950/40">
                {columns.map((col) => {
                  const content = col.render(row, rowIndex)
                  const isClass = typeof col.cellStyle === 'string'
                  const style = isClass ? undefined : (col.cellStyle as React.CSSProperties | undefined)
                  const cls = isClass ? (col.cellStyle as string) : ''

                  return (
                    <TableCell key={col.id} align={col.align || 'left'} style={style} className={`align-top ${cls}`}>
                      {content}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default CustomTable