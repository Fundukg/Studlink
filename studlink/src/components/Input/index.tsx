import cn from 'classnames'
import type { FormikProps } from 'formik'
// import { Button } from '../ButtonSend'
import { Alert } from '../Alert'
import { ButtonSelect } from '../Button'
import css from './index.module.scss'

export const Input = ({
  name,
  label,
  bottoms = [],
  formik,
  maxWidth,
  type = 'text',
  
}: {
  name: string
  label: string
  bottoms?: string[]
  formik: FormikProps<any>
  maxWidth?: number
  type?: 'text' | 'password'
}) => {
  const value = formik.values[name]
  const errors = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!errors
  const disabled = formik.isSubmitting

  return (
    <div className={cn({ [css.field]: true, [css.disabled]: disabled })}>
      <label className={css.label} htmlFor={name}>
        {label}
      </label>
      {bottoms.map((num) => (
        <ButtonSelect key={num} onClick={() => formik.setFieldValue(name, num)}>
          {num}
        </ButtonSelect>
      ))}
      <input
        className={cn({ [css.input]: true, [css.invalid]: invalid })}
        style={{ maxWidth }}
        type= {type}
        onChange={(e) => {
          void formik.setFieldValue(name, e.target.value)
        }}
        onBlur={() => formik.setFieldTouched(name)}
        value={value}
        name={name}
        id={name}
        disabled={disabled}
      />
      {invalid && <Alert color="red">{errors}</Alert>}
    </div>
  )
}

export const ReadOnlyField = ({ 
  label, 
  value, 
  maxWidth,
  className 
}: { 
  label: string; 
  value: string;
  maxWidth?: number;
  className?: string;
}) => (
  <div 
    className={cn(css.field, className)} 
    style={{ maxWidth }}
  >
    <label className={css.label}>{label}</label>
    <div className={cn(css.input, css.readOnly)}>
      {value}
    </div>
  </div>
)
