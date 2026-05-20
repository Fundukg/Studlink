import cn from 'classnames'
import type { FormikProps } from 'formik'
import { Alert } from '../Alert'
import css from './index.module.scss'

type InputProps = {
  name: string
  label: string
  bottoms?: string[] // Быстрые пресеты (например, номера курсов)
  formik: FormikProps<any>
  maxWidth?: number
  type?: 'text' | 'password' | 'number'
  placeholder?: string
}

export const Input = ({
  name,
  label,
  bottoms = [],
  formik,
  maxWidth,
  placeholder,
  type = 'text',
}: InputProps) => {
  const value = formik.values[name]
  const errors = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!errors
  const disabled = formik.isSubmitting

  return (
    <div
      className={cn(css.field, {
        [css.disabled]: disabled,
        [css.invalid]: invalid,
      })}
      style={{ maxWidth }}
    >
      <div className={css.header}>
        <label className={css.label} htmlFor={name}>
          {label}
        </label>

        {/* Рендерим кнопки пресетов, если они есть */}
        {bottoms.length > 0 && (
          <div className={css.presets}>
            {bottoms.map((num) => (
              <button
                key={num}
                type="button"
                className={cn(css.presetBtn, { [css.active]: value === num })}
                onClick={() => formik.setFieldValue(name, num)}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={css.inputWrapper}>
        <input
          className={css.input}
          type={type}
          placeholder={placeholder}
          onChange={(e) => void formik.setFieldValue(name, e.target.value)}
          onBlur={() => formik.setFieldTouched(name)}
          value={value ?? ''}
          name={name}
          id={name}
          disabled={disabled}
          autoComplete="off"
        />
      </div>

      {invalid && (
        <div className={css.errorWrapper}>
          <Alert color="red">{errors}</Alert>
        </div>
      )}
    </div>
  )
}

export const ReadOnlyField = ({
  label,
  value,
  maxWidth,
  className,
}: {
  label: string
  value: string | number
  maxWidth?: number
  className?: string
}) => (
  <div
    className={cn(css.field, css.readOnlyField, className)}
    style={{ maxWidth }}
  >
    <label className={css.label}>{label}</label>
    <div className={css.displayValue}>{value || '—'}</div>
  </div>
)
