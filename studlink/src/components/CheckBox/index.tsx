import cn from 'classnames'
import type { FormikProps } from 'formik'
import React from 'react'
import css from './index.module.scss'

type Option = {
  label: string
  value: string
  icon?: React.ReactNode // Возможность передать иконку (например, из react-icons)
}

type CheckboxProps = {
  name: string
  label: string
  options: Option[]
  formik: FormikProps<any>
  layout?: 'grid' | 'row' // 'grid' для групп/курсов, 'row' для платформ
  disabled?: boolean
}


export const Checkbox = ({
  name,
  label,
  options,
  formik,
  layout = 'grid',
  disabled = false,
}: CheckboxProps) => {
  // Получаем текущий массив выбранных значений из Formik
  const selectedValues = Array.isArray(formik.values[name])
    ? formik.values[name]
    : []

  const toggleOption = (val: string) => {
    const isSelected = selectedValues.includes(val)
    const nextValue = isSelected
      ? selectedValues.filter((v: string) => v !== val)
      : [...selectedValues, val]

    formik.setFieldValue(name, nextValue)
  }

  return (
    <div className={css.container}>
      <span className={css.groupLabel}>{label}</span>
      <div className={cn(css.wrapper, css[layout])}>
        {options.map((option) => {
          const isActive = selectedValues.includes(option.value)

          return (
            <div
            style={{ pointerEvents: disabled ? 'none' : 'auto' }}
              key={option.value}
              className={cn(css.item, { [css.active]: isActive })}
              onClick={() => toggleOption(option.value)}
            >
              <div className={css.checkbox}>
                {isActive && <div className={css.innerCheck} />}
              </div>
              <div className={css.content}>
                {option.icon && (
                  <span className={css.icon}>{option.icon}</span>
                )}
                <span className={css.text}>{option.label}</span>
              </div>
            </div>
          )
        })}
      </div>
      {formik.errors[name] && formik.touched[name] && (
        <span className={css.error}>{formik.errors[name] as string}</span>
      )}
    </div>
  )
}
