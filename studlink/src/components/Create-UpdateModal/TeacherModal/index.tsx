// src/components/TeacherModal/index.tsx
import { useFormik } from 'formik'
import { useState, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { FiSearch } from 'react-icons/fi'
import { trpc } from '../../../lib/trpc'
import { Input } from '../../Input'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

type TeacherModalProps = {
  isOpen: boolean
  onClose: () => void
  staff?: any
}

export const TeacherModal = ({
  isOpen,
  onClose,
  staff,
}: TeacherModalProps) => {
  const utils = trpc.useUtils()
  const isEdit = !!staff
// console.log('initialGroupIds:', initialGroupIds);
  const { data: groupsData } = trpc.getGroup.useQuery()
  const groups = groupsData?.Group || []

  const createMutation = trpc.createTeacher.useMutation()
  const updateMutation = trpc.updateTeacher.useMutation()

  const initialGroupIds = staff?.groupIds?.map((id: any) => String(id)) || []

  const formik = useFormik({
    initialValues: {
      nick: staff?.nick || '',
      password: '',
      firstName: staff?.firstName || '',
      lastName: staff?.lastName || '',
      middleName: staff?.middleName || '',
      groupIds: initialGroupIds,
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
            groupIds: values.groupIds.map(String),
          })
          toast.success(`Данные преподавателя ${values.nick} обновлены`)
        } else {
          if (!values.password) {
            toast.error('Пароль обязателен при создании')
            return
          }
          await createMutation.mutateAsync({
            nick: values.nick,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName,
            groupIds: values.groupIds,
          })
          toast.success(`Преподаватель ${values.nick} успешно создан`)
        }
        utils.getTeacherList.invalidate()
        onClose()
        formik.resetForm()
      } catch (e: any) {
        toast.error(e.message || 'Произошла ошибка при сохранении')
      }
    },
  })

  // Состояние для поиска по группам
  const [groupSearch, setGroupSearch] = useState('')

  // Фильтрация групп
  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) {return groups}
    const query = groupSearch.toLowerCase()
    return groups.filter((group: any) =>
      group.name.toLowerCase().includes(query)
    )
  }, [groups, groupSearch])

  // Обработчик чекбокса
  const handleCheckboxChange = (groupId: string) => {
    const current = formik.values.groupIds
    const newValue = current.includes(groupId)
      ? current.filter((id: string) => id !== groupId)
      : [...current, groupId]
    formik.setFieldValue('groupIds', newValue)
  }

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit ? `Редактирование: ${staff?.nick}` : 'Создание преподавателя'
      }
      maxWidth={600}
      footer={
        <div className={css.modalFooter}>
          <button className={css.cancelBtn} onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={css.submitBtn}
            form="teacher-form"
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
        id="teacher-form"
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

          {/* Улучшенный мультиселект групп */}
          <div className={css.inputGroup}>
            <label className={css.label}>Закреплённые группы</label>
            <div className={css.groupSelector}>
              <div className={css.searchWrapper}>
                <FiSearch className={css.searchIcon} />
                <input
                  type="text"
                  placeholder="Поиск группы..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className={css.groupSearchInput}
                />
              </div>
              <div className={css.checkboxList}>
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group: any) => (
                    <label key={group.id} className={css.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formik.values.groupIds.includes(
                          String(group.id)
                        )}
                        onChange={() => handleCheckboxChange(String(group.id))}
                      />
                      <span>{group.name}</span>
                    </label>
                  ))
                ) : (
                  <div className={css.noResults}>Ничего не найдено</div>
                )}
              </div>
              {groups.length === 0 && (
                <div className={css.hint}>Нет доступных групп</div>
              )}
            </div>
          </div>
        </div>
      </form>
    </UniversalModal>
  )
}
