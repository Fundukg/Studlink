import { zCreateDistributionTrpcInput } from '@parkstick/backend/src/router/createDistribution/input'
import { useEffect, useMemo, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { Alert } from '../../components/Alert'
import { Checkbox } from '../../components/CheckBox'
import { List, ListSelect } from '../../components/List'
import { MailingHeader } from '../../components/MailingHeader'
import type { PlatformType } from '../../components/PlatformSelector'
import { PlatformSelector } from '../../components/PlatformSelector'
import { Textarea } from '../../components/Textarea'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const NewDistributionPage = withPageWrapper({
  authorizedOnly: true,
})(() => {
  const createDistribution = trpc.createDistribution.useMutation()

  // --- 1. СОСТОЯНИЯ ФИЛЬТРОВ ---
  const [facultyId, setFacultyId] = useState<string>('')
  const [deptId, setDeptId] = useState<string>('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  const faculties = trpc.getStructure.getFaculties.useQuery()
  const departments = trpc.getStructure.getDepartmentsByFaculty.useQuery(
    { facultyId },
    { enabled: !!facultyId }
  )
  const groups = trpc.getStructure.getGroupsByDepartment.useQuery(
    { departmentId: deptId },
    { enabled: !!deptId }
  )

  useEffect(() => {
    if (departments.data?.length === 1) {
      setDeptId(departments.data[0].id)
    }
  }, [departments.data])

  // --- 2. ОПЦИИ ДЛЯ ЧЕКБОКСОВ ---
  const courseOptions = useMemo(() => {
    if (!groups.data) {
      return []
    }
    const uniqueCourses = Array.from(
      new Set(groups.data.map((g) => g.course))
    ).sort()
    return uniqueCourses.map((c) => ({ label: `${c} курс`, value: String(c) }))
  }, [groups.data])

  const groupOptions = useMemo(() => {
    if (!groups.data) {
      return []
    }
    return groups.data
      .filter(
        (g) =>
          selectedCourses.length === 0 ||
          selectedCourses.includes(String(g.course))
      )
      .map((g) => ({ label: g.name, value: g.id }))
  }, [groups.data, selectedCourses])

  // --- 3. ФОРМА ---
  const { formik, alertProps } = useForm({
    initialValues: {
      targetType: 'ALL' as
        | 'ALL'
        | 'FACULTY'
        | 'DEPARTMENT'
        | 'GROUP'
        | 'COURSE',
      text: '',
      platform:
        (localStorage.getItem('platform_distribution') as PlatformType) ||
        'ALL',
      targetIds: [],
    },
    validationSchema: zCreateDistributionTrpcInput,
    onSubmit: async (values) => {
      try {
        let ids: string[] = []

        switch (values.targetType) {
          case 'FACULTY':
            ids = [facultyId]
            break
          case 'DEPARTMENT':
            ids = [deptId]
            break
          case 'COURSE':
            ids = selectedCourses
            break
          case 'GROUP':
            ids =
              selectedGroups.length > 0
                ? selectedGroups
                : groupOptions.map((o) => o.value)
            break
        }

        await createDistribution.mutateAsync({
          ...values,
          targetIds: ids,
        })

        formik.resetForm()
        setFacultyId('')
        setDeptId('')
        setSelectedCourses([])
        setSelectedGroups([])
      } catch (error) {
        console.error('Ошибка при рассылке:', error)
        throw error
      }
    },
    successMessage: 'Рассылка успешно выполнена',
    showValidationAlert: true,
  })

  // --- 4. ХЕЛПЕР ДЛЯ ЧЕКБОКСОВ (ИСПРАВЛЕННЫЙ) ---
  const createCheckboxProps = (
    name: string,
    state: string[],
    setState: (v: string[]) => void
  ) => ({
    values: { [name]: state }, // Теперь ключ совпадает с name компонента
    setFieldValue: (_: string, val: string[]) => setState(val),
    errors: {},
    touched: {},
  })

  return (
    <div className={css.container}>
      <MailingHeader />

      <form onSubmit={formik.handleSubmit}>
        <div className={css.content}>
          {/* ЛЕВАЯ КОЛОНКА: Контент сообщения */}
          <div className={css.leftSide}>
            <div className={`${css.card} ${css.messageCard}`}>
              <h2 className={css.sectionTitle}>Содержание сообщения</h2>
              <div className={css.formSection}>
                <Textarea
                  name="text"
                  formik={formik}
                  label="Текст сообщения"
                />
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: Аудитория и Платформы */}
          <div className={css.rightSide}>
            <div className={css.card}>
              <h2 className={css.sectionTitle}>Аудитория</h2>

              {/* Выбор типа всегда активен */}
              <div className={css.formSection}>
                <ListSelect
                  formik={formik}
                  name="targetType"
                  label="Тип рассылки"
                  options={[
                    { value: 'ALL', label: 'Все пользователи' },
                    { value: 'FACULTY', label: 'По Факультету' },
                    { value: 'DEPARTMENT', label: 'По Кафедре' },
                    { value: 'COURSE', label: 'По Курсам' },
                    { value: 'GROUP', label: 'По Группам' },
                  ]}
                  onChange={(e: any) => {
                    formik.handleChange(e)
                    setFacultyId('')
                    setDeptId('')
                    setSelectedCourses([])
                    setSelectedGroups([])
                  }}
                />
              </div>

              {/* Блок Факультет/Кафедра */}
              <div
                className={`${css.groupWrapper} ${formik.values.targetType === 'ALL' ? css.disabled : ''}`}
              >
                <List
                  name="faculty"
                  label=""
                  listlabel="Факультет"
                  formik={formik}
                  groups={faculties.data || []}
                  value={facultyId}
                  disabled={formik.values.targetType === 'ALL'} // Передаем и в пропс и в класс выше
                  onChange={(e: any) => {
                    setFacultyId(e.target.value)
                    setDeptId('')
                  }}
                />

                <List
                  name="dept"
                  label=""
                  listlabel="Кафедра"
                  formik={formik}
                  groups={departments.data || []}
                  value={deptId}
                  disabled={
                    formik.values.targetType === 'FACULTY' ||
                    formik.values.targetType === 'ALL' ||
                    !facultyId
                  }
                  onChange={(e: any) => {
                    setDeptId(e.target.value)
                  }}
                />
              </div>

              {/* Блок Курсы/Группы с защитой от прыжков */}
              <div
                className={`${css.groupWrapper} ${
                  !['COURSE', 'GROUP'].includes(formik.values.targetType) ||
                  !deptId
                    ? css.disabled
                    : ''
                }`}
              >
                <div className={css.checkboxScrollArea}>
                  <Checkbox
                    name="filter"
                    label="Курс:"
                    options={courseOptions}
                    formik={
                      createCheckboxProps(
                        'filter',
                        selectedCourses,
                        setSelectedCourses
                      ) as any
                    }
                    layout="grid"
                  />
                </div>

                <div className={css.checkboxScrollArea}>
                  <Checkbox
                    name="groups"
                    label="Группы:"
                    options={groupOptions}
                    formik={
                      createCheckboxProps(
                        'groups',
                        selectedGroups,
                        setSelectedGroups
                      ) as any
                    }
                    layout="grid"
                  />
                </div>
              </div>
            </div>

            {/* Блок Платформы */}
            <div className={css.card}>
              <h2 className={css.sectionTitle}>Платформы</h2>
              <PlatformSelector
                value={formik.values.platform}
                dialogue={false}
                onChange={(newPlatform) => {
                  formik.setFieldValue('platform', newPlatform)
                  localStorage.setItem('platform_distribution', newPlatform)
                }}
              />
            </div>
            <div className={css.footer}>
              <Alert {...alertProps} />
              <div className={css.buttonGroup}>
                <button
                  type="submit"
                  className={css.sendButton}
                  disabled={createDistribution.isPending}
                >
                  <FiSend style={{ marginRight: '8px' }} />
                  {createDistribution.isPending
                    ? 'Отправка...'
                    : 'Отправить рассылку'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
})
