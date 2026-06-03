// src/components/AdminModal/index.tsx
import { useFormik } from 'formik'
import { toast } from 'react-hot-toast'
import { trpc } from '../../../lib/trpc'
import { Input } from '../../Input'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

type AdminModalProps = {
  isOpen: boolean
  onClose: () => void
  staff?: any // объект администратора (при редактировании)
}

export const AdminModal = ({ isOpen, onClose, staff }: AdminModalProps) => {
  const utils = trpc.useUtils()
  const isEdit = !!staff

  const createMutation = trpc.createAdmin.useMutation()
  const updateMutation = trpc.updateAdmin.useMutation()

  const formik = useFormik({
    initialValues: {
      nick: staff?.nick || '',
      password: '',
      firstName: staff?.firstName || '',
      lastName: staff?.lastName || '',
      middleName: staff?.middleName || '',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await updateMutation.mutateAsync({
            id: staff.id,
            nick: values.nick,
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName,
          })
          toast.success(`Данные администратора ${values.nick} обновлены`)
        } else {
          await createMutation.mutateAsync({
            nick: values.nick,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName,
            role: 'ADMIN',
          })
          toast.success(`Администратор ${values.nick} успешно создан`)
        }

        // Обновляем список администраторов на странице
        utils.getAdminList.invalidate()
        onClose()
        formik.resetForm()
      } catch (e: any) {
        toast.error(e.message || 'Произошла ошибка при сохранении')
      }
    },
  })

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit ? `Редактирование: ${staff?.nick}` : 'Создание администратора'
      }
      maxWidth={600}
      footer={
        <div className={css.modalFooter}>
          <button className={css.cancelBtn} onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={css.submitBtn}
            form="admin-form"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      }
    >
      <form
        onSubmit={formik.handleSubmit}
        id="admin-form"
        className={css.modalForm}
      >
        <div className={css.formGrid}>
          <Input name="nick" label="Никнейм (Логин)" formik={formik} />
          <Input name="lastName" label="Фамилия" formik={formik} />
          <Input name="firstName" label="Имя" formik={formik} />
          <Input name="middleName" label="Отчество" formik={formik} />

          {!isEdit && (
            <Input
              name="password"
              label="Пароль"
              type="password"
              formik={formik}
            />
          )}
        </div>
      </form>
    </UniversalModal>
  )
}
