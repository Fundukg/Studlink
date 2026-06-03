// src/components/ProfileForm/index.tsx
import { useFormik } from 'formik'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { trpc } from '../../lib/trpc'
import { Button } from '../Button'
import { Input } from '../Input'
import css from './index.module.scss'

type ProfileFormProps = {
  mode: 'edit' | 'password'
  initialValues?: {
    nick: string
    lastName: string
    firstName: string
    middleName?: string | null
    email?: string | null
    phone?: string | null
  }
  onSuccess?: () => void
}

const editProfileSchema = z.object({
  nick: z.string().min(3, 'Минимум 3 символа').max(50).nullable().optional(),
  lastName: z.string().min(1, 'Обязательное поле').max(100),
  firstName: z.string().min(1, 'Обязательное поле').max(100),
  middleName: z.string().max(100).nullable().optional(),
  email: z.string().email('Неверный формат email').nullable().optional(),
  phone: z.string().min(5, 'Минимум 5 символов').max(20).nullable().optional(),
})

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Новый пароль должен отличаться от текущего',
    path: ['newPassword'],
  })

const toFormikErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {}
  error.errors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0] as string] = err.message
    }
  })
  return errors
}

export const ProfileForm = ({
  mode,
  initialValues,
  onSuccess,
}: ProfileFormProps) => {
  const utils = trpc.useUtils()
  const updateProfile = trpc.updateMyProfile.useMutation()
  const changePassword = trpc.changePassword.useMutation()

  const isEditMode = mode === 'edit'

  const formik = useFormik({
    initialValues: isEditMode
      ? {
          nick: initialValues?.nick || '',
          lastName: initialValues?.lastName || '',
          firstName: initialValues?.firstName || '',
          middleName: initialValues?.middleName || '',
          email: initialValues?.email || '',
          phone: initialValues?.phone || '',
        }
      : {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
    validate: (values) => {
      try {
        if (isEditMode) {
          editProfileSchema.parse(values)
        } else {
          changePasswordSchema.parse(values)
        }
        return {}
      } catch (error) {
        if (error instanceof z.ZodError) {
          return toFormikErrors(error)
        }
        return {}
      }
    },
    onSubmit: async (values) => {
      try {
        if (isEditMode) {
          await updateProfile.mutateAsync({
            nick: values.nick || null,
            lastName: values.lastName,
            firstName: values.firstName,
            middleName: values.middleName || null,
            email: values.email || null,
            phone: values.phone || null,
          })
          toast.success('Профиль успешно обновлён')
          await utils.getMe.invalidate()
          onSuccess?.()
        } else {
          // Явно приводим к строке (значения всегда есть, т.к. initialValues содержит пустые строки)
          const currentPassword = values.currentPassword as string
          const newPassword = values.newPassword as string

          if (!currentPassword || !newPassword) {
            toast.error('Заполните все поля')
            return
          }

          await changePassword.mutateAsync({
            currentPassword,
            password: newPassword,
            confirmPassword: values.confirmPassword as string,
          })
          toast.success('Пароль успешно изменён')
          formik.resetForm()
          onSuccess?.()
        }
      } catch (err: any) {
        toast.error(err.message || 'Ошибка при сохранении')
      }
    },
  })

  if (isEditMode) {
    return (
      <form onSubmit={formik.handleSubmit} className={css.form}>
        <div className={css.grid}>
          <Input name="nick" label="Никнейм (логин)" formik={formik} />
          <Input name="lastName" label="Фамилия" formik={formik} />
          <Input name="firstName" label="Имя" formik={formik} />
          <Input name="middleName" label="Отчество" formik={formik} />
          <Input name="email" label="Email" type="text" formik={formik} />
          <Input name="phone" label="Телефон" formik={formik} />
        </div>
        <div className={css.actions}>
          <Button type="submit" loading={formik.isSubmitting}>
            Сохранить изменения
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={formik.handleSubmit} className={css.form}>
      <div className={css.grid}>
        <Input
          name="currentPassword"
          label="Текущий пароль"
          type="password"
          formik={formik}
        />
        <Input
          name="newPassword"
          label="Новый пароль"
          type="password"
          formik={formik}
        />
        <Input
          name="confirmPassword"
          label="Подтвердите пароль"
          type="password"
          formik={formik}
        />
      </div>
      <div className={css.actions}>
        <Button type="submit" loading={formik.isSubmitting}>
          Сменить пароль
        </Button>
      </div>
    </form>
  )
}
