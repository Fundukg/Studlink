import { useFormik } from 'formik'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { trpc } from '../../lib/trpc'
import { Button } from '../Button'
import { Input } from '../Input'
import css from './index.module.scss'

type ProfileFormProps = {
  mode: 'edit' | 'password' | 'setup'
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

// 1. Схемы валидации
const editProfileSchema = z.object({
  nick: z.string().min(3, 'Минимум 3 символа').max(50).nullable().optional(),
  lastName: z.string().min(1, 'Обязательное поле').max(100),
  firstName: z.string().min(1, 'Обязательное поле').max(100),
  middleName: z.string().max(100).nullable().optional(),
  email: z.string().email('Неверный формат email').nullable().optional(),
  phone: z.string().min(5, 'Минимум 5 символов').max(20).nullable().optional(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    confirmPassword: z.string().min(6, 'Подтвердите пароль'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export const ProfileForm = ({
  mode,
  initialValues,
  onSuccess,
}: ProfileFormProps) => {
  const utils = trpc.useUtils()
  const updateProfile = trpc.updateMyProfile.useMutation()
  const changePassword = trpc.changePassword.useMutation()

  const isEditMode = mode === 'edit'
  const isSetupMode = mode === 'setup'
  const isPasswordMode = mode === 'password'

  const formik = useFormik({
    initialValues: {
      nick: initialValues?.nick || '',
      lastName: initialValues?.lastName || '',
      firstName: initialValues?.firstName || '',
      middleName: initialValues?.middleName || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {}

      // Валидация профиля
      if (isEditMode || isSetupMode) {
        const result = editProfileSchema.safeParse(values)
        if (!result.success)
          {Object.assign(errors, result.error.flatten().fieldErrors)}
      }

      // Валидация пароля (всегда обязательна в password или setup режиме)
      if (isPasswordMode || isSetupMode) {
        const result = passwordSchema.safeParse(values)
        if (!result.success)
          {Object.assign(errors, result.error.flatten().fieldErrors)}
      }

      return errors
    },
    onSubmit: async (values) => {
      try {
        // 1. Обновляем профиль если нужно
        if (isEditMode || isSetupMode) {
          await updateProfile.mutateAsync({
            nick: values.nick || null,
            lastName: values.lastName,
            firstName: values.firstName,
            middleName: values.middleName || null,
            email: values.email || null,
            phone: values.phone || null,
          })
        }

        // 2. Меняем пароль если нужно
        if (isPasswordMode || isSetupMode) {
          await changePassword.mutateAsync({
            currentPassword: values.currentPassword,
            password: values.newPassword,
            confirmPassword: values.confirmPassword,
          })
        }

        toast.success(
          isSetupMode
            ? 'Настройка профиля завершена!'
            : 'Данные успешно сохранены'
        )
        await utils.getMe.invalidate()
        onSuccess?.()
      } catch (err: any) {
        toast.error(err.message || 'Ошибка при сохранении')
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className={css.form}>
      <div className={css.grid}>
        {(isEditMode || isSetupMode) && (
          <>
            <Input name="nick" label="Никнейм (логин)" formik={formik} />
            <Input name="lastName" label="Фамилия" formik={formik} />
            <Input name="firstName" label="Имя" formik={formik} />
            <Input name="middleName" label="Отчество" formik={formik} />
            <Input name="email" label="Email" formik={formik} />
            <Input name="phone" label="Телефон" formik={formik} />
          </>
        )}

        {(isPasswordMode || isSetupMode) && (
          <>
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
          </>
        )}
      </div>

      <div className={css.actions}>
        <Button type="submit" loading={formik.isSubmitting}>
          {isSetupMode
            ? 'Завершить настройку'
            : isEditMode
              ? 'Сохранить изменения'
              : 'Сменить пароль'}
        </Button>
      </div>
    </form>
  )
}
