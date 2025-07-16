import type { FormikProps } from 'formik'

export const Input = ({
  name,
  label,
  bottoms,
  formik,
}: {
  name: string
  label: string
  bottoms: string[]
  formik: FormikProps<any>
}) => {
  const value = formik.values[name]
  const errors = formik.errors[name] as string | undefined
  const touched = formik.touched[name]

  return (
    <div style={{ marginBottom: 10 }}>
      <label htmlFor={name}>{label}</label>
      <br />
      {bottoms.map((num) => (
        <button key={num} type="button" style={{ marginRight: 5 }} onClick={() => formik.setFieldValue(name, num)}>
          {num}
        </button>
      ))}
      <input
        type="text"
        onChange={(e) => {
          void formik.setFieldValue(name, e.target.value)
        }}
        
        onBlur={() => formik.setFieldTouched(name)}
        value={value}
        name={name}
        id={name}
        disabled={formik.isSubmitting}
      />
      {!!touched && !!errors && <div style={{ color: 'red' }}>{errors}</div>}
    </div>
  )
}
