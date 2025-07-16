import cn from 'classnames'
import type { FormikProps } from 'formik'
import css from './index.module.scss'

export const Input = ({
  name,
  label,
  bottoms,
  formik,
  maxWidth,
}: {
  name: string
  label: string
  bottoms: string[]
  formik: FormikProps<any>
  maxWidth?: number
}) => {
  const value = formik.values[name]
  const errors = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!errors
  const disabled = formik.isSubmitting

  return (
    <div className={cn({ [css.field]: true, [css.disabled]: disabled })} style={{ marginBottom: 10 }}>
      <label className={css.label} htmlFor={name}>
        {label}
      </label>
      <br />
      {bottoms.map((num) => (
        <button key={num} type="button" style={{ marginRight: 5 }}  onClick={() => formik.setFieldValue(name, num)}>
          {num}
        </button>
      ))}
      <br />
      <input
        className={cn({ [css.input]: true, [css.invalid]: invalid })}
        style={{ maxWidth }}
        type="text"
        onChange={(e) => {
          void formik.setFieldValue(name, e.target.value)
        }}
        onBlur={() => formik.setFieldTouched(name)}
        value={value}
        name={name}
        id={name}
        disabled={disabled}
      />
      {invalid && <div className={css.error}>{errors}</div>}
    </div>
  )
}
