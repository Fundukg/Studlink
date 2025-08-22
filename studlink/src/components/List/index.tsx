import cn from 'classnames'
import type { FormikProps } from 'formik'
import { Alert } from '../Alert'
import css from './index.module.scss'

export const List = ({
  name,
  label,
  listlabel,
  groups,
  formik,
  maxWidth,
}: {
  name: string
  label: string
  listlabel: string
  groups: {
    id: string
    name: string
  }[]
  formik: FormikProps<any>
  maxWidth?: number
}) => {
  const value = formik.values[name]
  const errors = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!errors
  const disabled = formik.isSubmitting

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue(name, e.target.value)
  }

  return (
    <div className={cn({ [css.field]: true, [css.disabled]: disabled })}>
      <label className={css.label} htmlFor={name}>
        {label}
      </label>
      <select
        className={cn({ [css.input]: true, [css.invalid]: invalid, [css.select]: true })}
        style={{ maxWidth }}
        onChange={handleChange}
        onBlur={() => formik.setFieldTouched(name)}
        value={value}
        name={name}
        id={name}
        disabled={disabled}
      >
        <option value="">{listlabel}</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
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
  disabled?: boolean
  [props: string]: any
}) => {
  const value = formik.values[name]
  const errors = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!errors
  const isSubmitting = formik.isSubmitting

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue(name, e.target.value)
  }

  const handleBlur = () => {
    formik.setFieldTouched(name)
  }
  return (
    <div className={cn({ [css.field]: true, [css.disabled]: disabled || isSubmitting }, className)}>
      <label className={css.label} htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled || isSubmitting}
        className={cn({ [css.input]: true, [css.invalid]: invalid, [css.select]: true })}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {invalid && <Alert color="red">{errors}</Alert>}
    </div>
  )
}
