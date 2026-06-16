import cn from 'classnames'
import type { FormikProps } from 'formik'
import { Alert } from '../Alert'
import css from './index.module.scss'

type ListProps = {
  name: string
  label: string
  listlabel?: string
  groups: {
    id: string
    name: string
  }[]
  formik: FormikProps<any>
  maxWidth?: number
  disabled?: boolean
  // Добавляем опциональные пропсы для ручного управления
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const List = ({
  name,
  label,
  listlabel,
  groups,
  formik,
  maxWidth,
  value,
  onChange,
}: ListProps) => {
  // Если value передано снаружи — используем его, иначе берем из formik
  const currentValue = value !== undefined ? value : formik.values[name]
  const errors = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!errors
  const disabled = formik.isSubmitting

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e)
    } else {
      formik.setFieldValue(name, e.target.value)
    }
  }

  return (
    <div className={css.listField}>
      <label className={css.listLabel} htmlFor={name}>
        {label}
      </label>
      <select
        className={cn(css.select, { [css.invalid]: invalid })}
        style={{ maxWidth }}
        onChange={handleChange}
        onBlur={() => formik.setFieldTouched(name)}
        value={currentValue}
        name={name}
        id={name}
        disabled={disabled}
      >
        <option value="">{listlabel}</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id} className={css.option}>
            {group.name}
          </option>
        ))}
      </select>
      {invalid && <Alert color="red">{errors}</Alert>}
    </div>
  )
}

export const ListSelect = ({
  formik,
  name,
  label,
  options,
  disabled = false,
  className,
  ...props
}: {
  name: string
  label: string
  options: { value: string; label: string }[]
  formik: FormikProps<any> // Добавил явный тип для formik
  disabled?: boolean
  className?: string
  [props: string]: any
}) => {
  const value = formik.values[name]
  const errors = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!errors
  const isSubmitting = formik.isSubmitting
  // console.log(errors)
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue(name, e.target.value)
  }

  const handleBlur = () => {
    formik.setFieldTouched(name)
  }

  return (
    <div
      className={cn(
        css.listField,
        { [css.disabled]: disabled || isSubmitting },
        className
      )}
    >
      <label className={css.listLabel} htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled || isSubmitting}
        className={cn(css.select, { [css.invalid]: invalid })}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className={css.option}
          >
            {option.label}
          </option>
        ))}
      </select>
      {invalid && <Alert color="red">{errors}</Alert>}
    </div>
  )
}
