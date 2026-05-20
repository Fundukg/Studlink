import { zCreateStudentTrpcInput } from '@parkstick/backend/src/router/createStudent/input'
import { useFormik } from 'formik'
import { trpc } from '../../../lib/trpc'
import { Input } from '../../Input'
import { List } from '../../List'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

type StudentFormModalProps = {
  isOpen: boolean
  onClose: () => void
  student?: any | null
}

export const StudentModal = ({
  isOpen,
  onClose,
  student,
}: StudentFormModalProps) => {
  const utils = trpc.useUtils() // Используем актуальный useUtils

  const { data: groups } = trpc.getGroup.useQuery()
  const groupsData = groups?.Group || []
  const isEdit = !!student

  const createMutation = trpc.createStudent.useMutation()
  const updateMutation = trpc.updateStudent.useMutation()

  const formik = useFormik({
    initialValues: {
      id: student?.id || '',
      student_id: student?.student_id || '',
      name: student?.name || '',
      course: student?.course,
      groupId: student?.groupId || student?.group?.id || '',
    },
    enableReinitialize: true,
    // ИСПРАВЛЕНИЕ: Валидация Zod для Formik
    validate: (values) => {
      const result = zCreateStudentTrpcInput.safeParse(values)
      if (result.success) {
        return {}
      }

      // Преобразуем ошибки zod в формат formik
      const errors: any = {}
      result.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message
      })
      return errors
    },
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await updateMutation.mutateAsync({
            id: student.id,
            // Передаем данные в соответствии с твоей схемой input
            student_id: values.student_id,
            name: values.name,
            course: values.course,
            groupId: values.groupId,
          })
        } else {
          await createMutation.mutateAsync({
            ...values,
            course: values.course, // Гарантируем число
          })
        }

        await utils.getStudent.invalidate()
        onClose()
        formik.resetForm()
      } catch (e: any) {
        console.error('Mutation error:', e)
        alert(e.message || 'Ошибка при сохранении')
      }
    },
  })

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Редактирование студента' : 'Новый студент'}
      maxWidth={500}
      footer={
        <div className={css.modalFooter}>
          <button className={css.cancelBtn} onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={css.submitBtn}
            form="student-editor-form"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? 'Сохранение...'
              : isEdit
                ? 'Сохранить'
                : 'Создать'}
          </button>
        </div>
      }
    >
      <form
        id="student-editor-form"
        onSubmit={formik.handleSubmit}
        className={css.form}
      >
        <Input
          name="student_id"
          label="Номер зачетки / ID"
          placeholder="Например: 21-БИТ-05"
          formik={formik}
        />

        <Input
          name="name"
          label="Полное имя"
          placeholder="Иванов Иван Иванович"
          formik={formik}
        />

        <div className={css.row} style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <Input name="course" label="Курс" type="number" formik={formik} />
          </div>

          <div style={{ flex: 2 }}>
            <List
              name="groupId"
              label="Группа"
              listlabel="Выберите группу"
              formik={formik}
              groups={groupsData}
            />
          </div>
        </div>
      </form>
    </UniversalModal>
  )
}
