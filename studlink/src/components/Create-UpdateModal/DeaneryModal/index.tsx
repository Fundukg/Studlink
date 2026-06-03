import { useFormik } from 'formik'
import { toast } from 'react-hot-toast' // Или 'react-hot-toast' в зависимости от того, что установлено
import { trpc } from '../../../lib/trpc'
import { Input } from '../../Input'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

type DeaneryModalProps = {
  isOpen: boolean
  onClose: () => void
  staff?: any
}

export const DeaneryModal = ({
  isOpen,
  onClose,
  staff,
}: DeaneryModalProps) => {
  const utils = trpc.useUtils()
  const isEdit = !!staff
  // Получаем список факультетов
  const { data: facultiesData } = trpc.getFaculty.useQuery()
  const faculties = facultiesData?.Faculty || []

  const createMutation = trpc.createDeanery.useMutation()
  const updateMutation = trpc.updateDeanery.useMutation()

  const formik = useFormik({
    initialValues: {
      nick: staff?.nick || '',
      password: '',
      firstName: staff?.firstName || '',
      lastName: staff?.lastName || '',
      middleName: staff?.middleName || '',
      role: staff?.role || 'DEANERY',
      facultyId:
        faculties.find((f) => f.name === staff?.facultyName)?.id || '',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Валидация: если деканат, факультет обязан быть выбран
      if (values.role === 'DEANERY' && !values.facultyId) {
        toast.error('Ошибка валидации')
        return
      }

      try {
        if (isEdit) {
          await updateMutation.mutateAsync({
            id: staff.id,
            ...values,
            facultyId:
              values.role === 'DEANERY' ? values.facultyId : undefined,
          })
          toast.success(`Данные сотрудника ${values.nick} обновлены`)
        } else {
          await createMutation.mutateAsync(values)
          toast.success(`Сотрудник ${values.nick} успешно зарегистрирован`)
        }

        utils.getDeaneryList.invalidate() // Обновляем список персонала на странице DeaneryPage
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
        isEdit ? `Редактирование: ${staff?.nick}` : 'Регистрация сотрудника'
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
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      }
    >
      <form
        onSubmit={formik.handleSubmit}
        id="staff-form"
        className={css.modalForm}
      >
        <div className={css.formGrid}>
          <Input name="nick" label="Никнейм (Логин)" formik={formik} />
          <Input name="lastName" label="Фамилия" formik={formik} />
          <Input name="firstName" label="Имя" formik={formik} />
          <Input name="middleName" label="Отчество" formik={formik} />

          <div className={css.inputGroup}>
            <label className={css.label}>Роль в системе</label>
            <select
              name="role"
              onChange={formik.handleChange}
              value={formik.values.role}
              className={css.selectField}
            >
              <option value="DEANERY">Сотрудник деканата</option>
              <option value="TEACHER">Преподаватель</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>

          {formik.values.role === 'DEANERY' && (
            <div className={css.inputGroup}>
              <label className={css.label}>Привязка к факультету</label>
              <select
                name="facultyId"
                value={formik.values.facultyId}
                onChange={formik.handleChange}
                className={css.selectField}
                required
              >
                <option value="">-- Выберите факультет --</option>
                {faculties.map((f: { id: string; name: string }) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
