import cn from 'classnames'
import css from './index.module.scss'

type SkeletonProps = {
  className?: string
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rect' | 'circle'
}

export const Skeleton = ({ className, width, height, variant = 'rect' }: SkeletonProps) => {
  const customWidth = typeof width === 'number' ? `${width}px` : width
  const customHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div className={cn(css.skeleton, css[variant], className)} style={{ width: customWidth, height: customHeight }} />
  )
}
