import { zCreateStudentTrpcInput } from '@parkstick/backend/src/router/createStudent/input'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
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
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      middleName: student?.middleName || '',
      groupId: groupsData.find((g) => g.name === student?.group)?.id || '',
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
            student_id: values.student_id,
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName,
            groupId: values.groupId,
          })
          toast.success('Данные студента успешно обновлены')
        } else {
          await createMutation.mutateAsync({
            ...values,
          })
          toast.success('Студент успешно добавлен в систему')
        }

        await utils.getStudent.invalidate()
        onClose()
        formik.resetForm()
      } catch (e: any) {
        console.error('Mutation error:', e)
        // Выводим ошибку через кастомный тост
        toast.error(e.message || 'Произошла ошибка при сохранении')
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
        <div className={css.row} style={{ display: 'flex', gap: '10px' }}>
          <Input name="lastName" label="Фамилия" formik={formik} />
          <Input name="firstName" label="Имя" formik={formik} />
        </div>
        <Input name="middleName" label="Отчество" formik={formik} />

        <Input name="student_id" label="Номер зачетки" formik={formik} />

        <List
          name="groupId"
          label="Группа"
          listlabel="Выберите группу"
          formik={formik}
          groups={groupsData}
        />

        <div className={css.infoBox}>
          <small>* Курс определяется автоматически по номеру группы</small>
        </div>
      </form>
    </UniversalModal>
  )
}
