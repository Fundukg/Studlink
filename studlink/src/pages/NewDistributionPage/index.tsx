import { zCreateDistributionTrpcInput } from '@parkstick/backend/src/router/createDistribution/input'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FiSend } from 'react-icons/fi'
import { Alert } from '../../components/Alert'
import { Checkbox } from '../../components/CheckBox'
import { CustomToaster } from '../../components/CustomToaster'
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
    if (!groups.data) {return []}
    const uniqueCourses = Array.from(
      new Set(groups.data.map((g) => g.course))
    ).sort()
    return uniqueCourses.map((c) => ({ label: `${c} курс`, value: String(c) }))
  }, [groups.data])

  const groupOptions = useMemo(() => {
    if (!groups.data) {return []}
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
          default:
            ids = []
        }

        await createDistribution.mutateAsync({
          ...values,
          targetIds: ids,
        })

        toast.success('Рассылка успешно выполнена')
        formik.resetForm()
        setFacultyId('')
        setDeptId('')
        setSelectedCourses([])
        setSelectedGroups([])
      } catch (error: any) {
        console.error('Ошибка при рассылке:', error)
        toast.error(error.message || 'Не удалось отправить рассылку')
      }
    },
    successMessage: '', // убираем встроенный Alert, используем toast
    showValidationAlert: true,
  })

  // --- 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ УСЛОВНОГО ОТОБРАЖЕНИЯ ---
  const showFaculty = () => {
    const { targetType } = formik.values
    return (
      targetType === 'FACULTY' ||
      targetType === 'DEPARTMENT' ||
      targetType === 'COURSE' ||
      targetType === 'GROUP'
    )
  }

  const showDepartment = () => {
    const { targetType } = formik.values
    return (
      targetType === 'DEPARTMENT' ||
      targetType === 'COURSE' ||
      targetType === 'GROUP'
    )
  }

  // const showCoursesAndGroups = () => {
  //   const { targetType } = formik.values
  //   return (targetType === 'COURSE' || targetType === 'GROUP') && !!deptId
  // }

  const showCoursesOnly = () => {
    const { targetType } = formik.values
    return targetType === 'COURSE' && !!deptId
  }

  const showGroupsOnly = () => {
    const { targetType } = formik.values
    return targetType === 'GROUP' && !!deptId
  }

  // --- 5. ХЕЛПЕР ДЛЯ ЧЕКБОКСОВ (без изменений) ---
  const createCheckboxProps = (
    name: string,
    state: string[],
    setState: (v: string[]) => void
  ) => ({
    values: { [name]: state },
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

              {/* Выбор типа */}
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

              {/* Блок Факультет */}
              {showFaculty() && (
                <div className={css.groupWrapper}>
                  <List
                    name="faculty"
                    label=""
                    listlabel="Факультет"
                    formik={formik}
                    groups={faculties.data || []}
                    value={facultyId}
                    onChange={(e: any) => {
                      setFacultyId(e.target.value)
                      setDeptId('')
                    }}
                  />
                </div>
              )}

              {/* Блок Кафедра */}
              {showDepartment() && (
                <div className={css.groupWrapper}>
                  <List
                    name="dept"
                    label=""
                    listlabel="Кафедра"
                    formik={formik}
                    groups={departments.data || []}
                    value={deptId}
                    disabled={!facultyId}
                    onChange={(e: any) => setDeptId(e.target.value)}
                  />
                </div>
              )}

              {/* Блок Курсы (только для COURSE) */}
              {showCoursesOnly() && (
                <div className={css.groupWrapper}>
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
                </div>
              )}

              {/* Блок Курсы + Группы (только для GROUP) */}
              {showGroupsOnly() && (
                <>
                  <div className={css.groupWrapper}>
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
                  </div>
                  <div className={css.groupWrapper}>
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
                </>
              )}
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
      <CustomToaster />
    </div>
  )
})
