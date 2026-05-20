import { zSignUpTrpcInput } from '@parkstick/backend/src/router/signUp/input'
import { useFormik } from 'formik'
import { trpc } from '../../../lib/trpc'
import { Input } from '../../Input'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

type StaffModalProps = {
  isOpen: boolean
  onClose: () => void
  staff?: any // Если передано, значит это редактирование
}

export const StaffModal = ({ isOpen, onClose, staff }: StaffModalProps) => {
  const utils = trpc.useUtils()
  const isEdit = !!staff

  const signUpMutation = trpc.signUp.useMutation()
  const updateMutation = trpc.updateStaff.useMutation()

  const formik = useFormik({
    initialValues: {
      nick: staff?.nick || '',
      password: '',
      firstName: staff?.firstName || '',
      lastName: staff?.lastName || '',
      middleName: staff?.middleName || '',
      role: staff?.role || 'DEANERY',
    },
    enableReinitialize: true,
    validate: (values) => {
      // Для новых сотрудников пароль обязателен
      if (!isEdit && !values.password) {
        return { password: 'Пароль обязателен для нового сотрудника' }
      }
      const result = zSignUpTrpcInput.safeParse(values)
      if (result.success) {
        return {}
      }
      const errors: any = {}
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message
      })
      return errors
    },
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await updateMutation.mutateAsync({
            id: staff.id,
            nick: values.nick,
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName,
            role: values.role,
          })
        } else {
          await signUpMutation.mutateAsync(values as any)
        }

        utils.getStaff.invalidate()
        onClose()
        formik.resetForm()
      } catch (e: any) {
        alert(e.message)
      }
    },
  })

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit ? `Редактирование: ${staff.nick}` : 'Регистрация сотрудника'
      }
      maxWidth={600}
      footer={
        <div className={css.modalFooter}>
          <button className={css.cancelBtn} onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={css.submitBtn}
            form="staff-form"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {isEdit ? 'Сохранить изменения' : 'Создать аккаунт'}
          </button>
        </div>
      }
    >
      <form
        id="staff-form"
        onSubmit={formik.handleSubmit}
        className={css.modalForm}
      >
        <div className={css.formGrid}>
          <div className={css.fullWidth}>
            <Input
              name="nick"
              label="Никнейм (Логин)"
              placeholder="ivan_admin"
              formik={formik}
            />
          </div>

          <Input
            name="lastName"
            label="Фамилия"
            placeholder="Иванов"
            formik={formik}
          />
          <Input
            name="firstName"
            label="Имя"
            placeholder="Иван"
            formik={formik}
          />
          <Input
            name="middleName"
            label="Отчество (необязательно)"
            placeholder="Иванович"
            formik={formik}
          />

          <div className={css.inputGroup}>
            <label className={css.label}>Роль в системе</label>
            <select
              name="role"
              className={css.selectField}
              value={formik.values.role}
              onChange={formik.handleChange}
            >
              <option value="DEANERY">Сотрудник диканата</option>
              <option value="TEACHER">Преподаватель</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>

          {!isEdit && (
            <div className={css.fullWidth}>
              <Input
                name="password"
                label="Пароль"
                type="password"
                placeholder="Минимум 6 символов"
                formik={formik}
              />
            </div>
          )}
        </div>
      </form>
    </UniversalModal>
  )
}
