import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import css from './index.module.scss'

export type Column<T> = {
  header: React.ReactNode
  accessorKey?: keyof T
  render?: (row: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string | number
}

type UniversalTableProps<T> = {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function UniversalTable<T>({
  data,
  columns,
  emptyMessage = 'Данные не найдены',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: UniversalTableProps<T>) {
  return (
    <div className={css.tableWrapper}>
      {/* Обертка для горизонтального скролла */}
      <div className={css.tableScrollContainer}>
        <table className={css.table}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{ textAlign: col.align || 'left', width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={(row as any).id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey] || '—')
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: 'center', padding: '40px' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация (остается снаружи скролл-контейнера) */}
      {totalPages > 1 && onPageChange && (
        <div className={css.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <FiChevronLeft />
          </button>
          <span>
            Страница {currentPage} из {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  )
}
