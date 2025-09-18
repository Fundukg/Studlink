// Textarea компонент
import cn from 'classnames'
import type { FormikProps } from 'formik'
import { Alert } from '../Alert'
import css from './index.module.scss'

export const Textarea = ({
  name,
  label,
  formik,
  listlabel,
}: {
  name: string
  label: string
  formik: FormikProps<any>
  listlabel?: string
}) => {
  const value = formik.values[name]
  const errors = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!errors
  const disabled = formik.isSubmitting

  return (
    <div className={css.textareaField}>
      <label className={css.textareaLabel} htmlFor={name}>
        {label}
      </label>
      <textarea
        className={cn(css.textarea, { [css.invalid]: invalid })}
        onChange={(e) => {
          void formik.setFieldValue(name, e.target.value)
        }}
        onBlur={() => {
          formik.setFieldTouched(name)
        }}
        placeholder={listlabel}
        value={value}
        name={name}
        id={name}
        disabled={disabled}
      />
      {invalid && <Alert color="red">{errors}</Alert>}
    </div>
  )
}
