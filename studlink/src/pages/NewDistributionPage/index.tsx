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
import { useMe } from '../../lib/ctx'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const NewDistributionPage = withPageWrapper({
  authorizedOnly: true,
})(() => {
  const createDistribution = trpc.createDistribution.useMutation()

  // Получаем данные текущего авторизованного пользователя
  const { user } = useMe()
  const me = user

  // --- 1. СОСТОЯНИЯ ФИЛЬТРОВ ---
  const [facultyId, setFacultyId] = useState<string>('')
  const [deptId, setDeptId] = useState<string>('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])

  const faculties = trpc.getStructure.getFaculties.useQuery()
  const departments = trpc.getStructure.getDepartmentsByFaculty.useQuery(
    { facultyId },
    { enabled: !!facultyId }
  )
  const groups = trpc.getStructure.getGroupsByDepartment.useQuery(
    { departmentId: deptId },
    { enabled: !!deptId }
  )

  // Получаем список преподавателей (требует права view:staff)
  const teachers = trpc.getTeacherList.useQuery(undefined, {
    enabled: me?.role === 'DEANERY' || me?.role === 'ADMIN',
  })

  // Автоматическая установка факультета для деканата
  useEffect(() => {
    if (me?.role === 'DEANERY' && me.deanery?.faculty?.id && faculties.data) {
      setFacultyId(me.deanery.faculty.id)
    }
  }, [me, faculties.data])

  useEffect(() => {
    if (departments.data?.length === 1) {
      setDeptId(departments.data[0].id)
    }
  }, [departments.data])

  // --- 2. ОГРАНИЧЕНИЯ ОПЦИЙ И ФИЛЬТРАЦИЯ ---

  // Фильтруем список факультетов: деканат видит только свой
  const filteredFaculties = useMemo(() => {
    if (!faculties.data) {
      return []
    }
    if (me?.role === 'DEANERY' && me.deanery?.faculty?.id) {
      return faculties.data.filter((f) => f.id === me.deanery!.faculty!.id)
    }
    return faculties.data
  }, [faculties.data, me])

  // Доступные типы рассылок в зависимости от роли
  const targetTypeOptions = useMemo(() => {
    if (me?.role === 'TEACHER') {
      return [{ value: 'GROUP', label: 'По Группам' }]
    }
    if (me?.role === 'DEANERY') {
      return [
        { value: 'FACULTY', label: 'По Факультету' },
        { value: 'DEPARTMENT', label: 'По Кафедре' },
        { value: 'COURSE', label: 'По Курсам' },
        { value: 'GROUP', label: 'По Группам' },
        { value: 'TEACHER', label: 'Преподаватели' },
      ]
    }
    return [
      // { value: 'ALL', label: 'Все пользователи' },
      { value: 'FACULTY', label: 'По Факультету' },
      { value: 'DEPARTMENT', label: 'По Кафедре' },
      { value: 'COURSE', label: 'По Курсам' },
      { value: 'GROUP', label: 'По Группам' },
      { value: 'TEACHER', label: 'Преподаватели' },
    ]
  }, [me])

  const defaultTargetType = useMemo(() => {
    return me?.role === 'TEACHER' ? 'GROUP' : 'ALL'
  }, [me])

  // Опции курсов (только для деканата/админа)
  const courseOptions = useMemo(() => {
    if (!groups.data || me?.role === 'TEACHER') {
      return []
    }

    const uniqueCourses = Array.from(
      new Set(groups.data.map((g) => g.course))
    ).sort()

    return uniqueCourses.map((c) => ({ label: `${c} курс`, value: String(c) }))
  }, [groups.data, me])

  // Опции групп (для преподавателя берем напрямую из me.teacher.assignments)
  const groupOptions = useMemo(() => {
    if (me?.role === 'TEACHER' && me.teacher?.assignments) {
      return me.teacher.assignments.map((a: any) => ({
        label: a.group.name,
        value: a.group.id,
      }))
    }

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
  }, [groups.data, selectedCourses, me])

  const teacherOptions = useMemo(() => {
    if (!teachers.data?.staff) {
      return []
    }
    return teachers.data.staff.map((t) => ({
      label:
        `${t.lastName} ${t.firstName} ${t.middleName || ''} (${t.nick})`.trim(),
      value: t.id,
    }))
  }, [teachers.data])

  // --- 3. ФОРМА ---
  const { formik, alertProps } = useForm({
    initialValues: {
      targetType: defaultTargetType as any,
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
                : groupOptions.map((o: any) => o.value)
            break
          case 'TEACHER':
            ids = selectedTeachers
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
        if (me?.role !== 'DEANERY') {
          setFacultyId('')
        }
        setDeptId('')
        setSelectedCourses([])
        setSelectedGroups([])
        setSelectedTeachers([])
      } catch (error: any) {
        console.error('Ошибка при рассылке:', error)
        toast.error(error.message || 'Не удалось отправить рассылку')
      }
    },
    successMessage: '',
    showValidationAlert: true,
  })

  // Переключаем значение targetType при подгрузке пользователя
  useEffect(() => {
    if (me) {
      formik.setFieldValue('targetType', defaultTargetType)
    }
  }, [me, defaultTargetType])

  // --- 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ УСЛОВНОГО ОТОБРАЖЕНИЯ ---
  const showFaculty = () => {
    const { targetType } = formik.values
    if (me?.role === 'TEACHER') {
      return false
    }
    return (
      targetType === 'FACULTY' ||
      targetType === 'DEPARTMENT' ||
      targetType === 'COURSE' ||
      targetType === 'GROUP'
    )
  }

  const showDepartment = () => {
    const { targetType } = formik.values
    if (me?.role === 'TEACHER') {
      return false
    }
    return (
      targetType === 'DEPARTMENT' ||
      targetType === 'COURSE' ||
      targetType === 'GROUP'
    )
  }

  const showCoursesOnly = () => {
    const { targetType } = formik.values
    if (me?.role === 'TEACHER') {
      return false
    }
    return targetType === 'COURSE' && !!deptId
  }

  const showGroupsOnly = () => {
    const { targetType } = formik.values
    if (me?.role === 'TEACHER') {
      return targetType === 'GROUP'
    }
    return targetType === 'GROUP' && !!deptId
  }

  const showTeachersOnly = () => {
    return formik.values.targetType === 'TEACHER'
  }

  // --- 5. ХЕЛПЕР ДЛЯ ЧЕКБОКСОВ ---
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
      <div className={css.alertContainer}>
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
                    label=""
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
                    options={targetTypeOptions}
                    onChange={(e: any) => {
                      formik.handleChange(e)
                      if (me?.role !== 'DEANERY') {
                        setFacultyId('')
                      }
                      setDeptId('')
                      setSelectedCourses([])
                      setSelectedGroups([])
                      setSelectedTeachers([])
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
                      groups={filteredFaculties}
                      value={facultyId}
                      disabled={me?.role === 'DEANERY'}
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
                    {me?.role !== 'TEACHER' && (
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

                {/* Блок Преподаватели (только для TEACHER/DEANERY) */}
                {showTeachersOnly() && (
                  <div className={css.groupWrapper}>
                    <div className={css.checkboxScrollArea}>
                      <Checkbox
                        name="TEACHER"
                        label="Преподаватели:"
                        options={teacherOptions}
                        formik={
                          createCheckboxProps(
                            'TEACHER',
                            selectedTeachers,
                            setSelectedTeachers
                          ) as any
                        }
                        layout="grid"
                      />
                    </div>
                  </div>
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
    </div>
  )
})
