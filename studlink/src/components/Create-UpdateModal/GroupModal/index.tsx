import { useFormik } from 'formik'
import { z } from 'zod'
import { trpc } from '../../../lib/trpc'
import { Input } from '../../Input'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

// Схема валидации для группы
const groupSchema = z.object({
  name: z
    .string()
    .min(2, 'Минимум 2 символа')
    .regex(
      /^.\d.*/,
      'Второй символ в названии должен быть цифрой курса (напр. Б11-01)'
    ),
  departmentId: z.string().min(1, 'Выберите кафедру'),
})

type GroupModalProps = {
  isOpen: boolean
  onClose: () => void
  group?: any // Если передано, значит это редактирование
}

export const GroupModal = ({ isOpen, onClose, group }: GroupModalProps) => {
  const utils = trpc.useUtils()
  const isEdit = !!group

  // Подгружаем кафедры для выпадающего списка
  const { data: deptData } = trpc.getDepartment.useQuery()

  const createMutation = trpc.createGroup.useMutation()
  const updateMutation = trpc.updateGroup.useMutation()

  const formik = useFormik({
    initialValues: {
      name: group?.name || '',
      departmentId: group?.departmentId || '',
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = groupSchema.safeParse(values)
      if (result.success) {return {}}
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
            id: group.id,
            name: values.name,
            departmentId: values.departmentId,
          })
        } else {
          await createMutation.mutateAsync(values)
        }

        // Инвалидация кэша для обновления списка групп
        utils.getGroup.invalidate()
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
      title={isEdit ? 'Редактировать группу' : 'Создать новую группу'}
      maxWidth={450}
      footer={
        <div className={css.modalFooter}>
          <button className={css.cancelBtn} onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={css.submitBtn}
            form="group-form"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      }
    >
      <form
        id="group-form"
        onSubmit={formik.handleSubmit}
        className={css.modalForm}
      >
        <Input
          name="name"
          label="Название группы"
          placeholder="Например: Б21-501"
          formik={formik}
        />

        <div className={css.inputGroup}>
          <label className={css.label}>Кафедра</label>
          <select
            name="departmentId"
            className={`${css.selectField} ${
              formik.errors.departmentId && formik.touched.departmentId
                ? css.errorInput
                : ''
            }`}
            value={formik.values.departmentId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="" disabled>
              Выберите кафедру...
            </option>
            {deptData?.Department.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.faculty.name})
              </option>
            ))}
          </select>
          {formik.errors.departmentId && formik.touched.departmentId && (
            <div className={css.errorText}>
              {formik.errors.departmentId as string}
            </div>
          )}
        </div>

        <div className={css.infoBox}>
          <small>
            * Курс будет определен автоматически по второму символу названия
            группы.
          </small>
        </div>
      </form>
    </UniversalModal>
  )
}
