import { useFormik } from 'formik'
import { z } from 'zod'
import { Input } from '../../../components/Input'
import { UniversalModal } from '../../../components/UniversalModal'
import { trpc } from '../../../lib/trpc'
import { List } from '../../List'
import css from './index.module.scss'

// Схема валидации
const departmentSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  facultyId: z.string().min(1, 'Выберите факультет'),
})

type DepartmentModalProps = {
  isOpen: boolean
  onClose: () => void
  department?: any // Если есть, значит режим редактирования
}

export const DepartmentModal = ({
  isOpen,
  onClose,
  department,
}: DepartmentModalProps) => {
  const utils = trpc.useUtils()
  const isEdit = !!department
  // Загружаем список факультетов для Select
  const { data: facultyData } = trpc.getFaculty.useQuery()
  const createMutation = trpc.createDepartment.useMutation()
  const updateMutation = trpc.updateDepartment.useMutation()

  const formik = useFormik({
    initialValues: {
      name: department?.name || '',
      facultyId: department?.faculty.id || '',
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = departmentSchema.safeParse(values)
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
            id: department.id,
            name: values.name,
            facultyId: values.facultyId,
          })
        } else {
          await createMutation.mutateAsync(values)
        }

        // Обновляем списки
        utils.getDepartment.invalidate()
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
      title={isEdit ? 'Редактировать кафедру' : 'Новая кафедра'}
      maxWidth={450}
      footer={
        <div className={css.modalFooter}>
          <button className={css.cancelBtn} onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={css.submitBtn}
            form="department-form"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      }
    >
      <form
        id="department-form"
        onSubmit={formik.handleSubmit}
        className={css.modalForm}
      >
        <Input
          name="name"
          label="Название кафедры"
          placeholder="Например: Кафедра высшей математики"
          formik={formik}
        />
        <List
          name="facultyId"
          label="Факультет"
          listlabel="Выберите факультет..."
          groups={facultyData?.Faculty || []} // передаем данные напрямую
          formik={formik}
        />
      </form>
    </UniversalModal>
  )
}
