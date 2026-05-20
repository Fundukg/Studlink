import { useFormik } from 'formik'
import { z } from 'zod'
import { trpc } from '../../../lib/trpc'
import { Input } from '../../Input'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

// Схема валидации прямо здесь для надежности
const facultySchema = z.object({
  name: z.string().min(3, 'Минимум 3 символа'),
})

export const FacultyModal = ({ isOpen, onClose, faculty }: any) => {
  const utils = trpc.useUtils()
  const isEdit = !!faculty

  const createMutation = trpc.createFaculty.useMutation()
  const updateMutation = trpc.updateFaculty.useMutation()

  const formik = useFormik({
    initialValues: {
      name: faculty?.name || '',
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = facultySchema.safeParse(values)
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
            id: faculty.id,
            name: values.name,
          })
        } else {
          await createMutation.mutateAsync(values)
        }
        utils.getFaculty.invalidate()
        onClose()
      } catch (e: any) {
        alert(e.message)
      }
    },
  })

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Редактировать факультет' : 'Новый факультет'}
      maxWidth={400}
      footer={
        <div className={css.modalFooter}>
          <button className={css.cancelBtn} onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={css.submitBtn}
            form="faculty-form"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      }
    >
      <form id="faculty-form" onSubmit={formik.handleSubmit}>
        <Input
          name="name"
          label="Название факультета"
          placeholder="Например: Факультет Экономики"
          formik={formik}
        />
      </form>
    </UniversalModal>
  )
}
