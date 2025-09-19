// Компоненты форм (StudentForm, GroupForm, FacultyForm, DepartmentForm)

import { zCreateDepartmentTrpcInput } from '@parkstick/backend/src/router/createDepartment/input'
import { zCreateFacultyTrpcInput } from '@parkstick/backend/src/router/createFaculty/input'
import { zCreateGroupTrpcInput } from '@parkstick/backend/src/router/createGroup/input'
import { zCreateStudentTrpcInput } from '@parkstick/backend/src/router/createStudent/input'
import { zSignUpTrpcInput } from '@parkstick/backend/src/router/signUp/input'
import z from 'zod'
import { useMe } from '../../lib/ctx'
import { useForm } from '../../lib/form'
import { trpc } from '../../lib/trpc'
import { Alert } from '../Alert'
import { ButtonSend } from '../Button'
import { FormItems } from '../FormItems'
import { Input } from '../Input'
import { List } from '../List'
import { Segment } from '../Segment'
import css from './index.module.scss'

// Они будут аналогичны вашим существующим компонентам, но с добавлением props onCancel и onSuccess
type FormProps = {
  onCancel: () => void
  onSuccess: () => void
}
type TabType = 'students' | 'groups' | 'faculties' | 'departments' | 'employees'
export const CreateForm = ({
  type,
  onCancel,
  onSuccess,
}: {
  type: TabType
  onCancel: () => void
  onSuccess: () => void
}) => {
  switch (type) {
    case 'students':
      return <StudentForm onCancel={onCancel} onSuccess={onSuccess} />
    case 'groups':
      return <GroupForm onCancel={onCancel} onSuccess={onSuccess} />
    case 'departments':
      return <DepartmentForm onCancel={onCancel} onSuccess={onSuccess} />
    case 'faculties':
      return <FacultyForm onCancel={onCancel} onSuccess={onSuccess} />
    case 'employees':
      return <StaffForm onCancel={onCancel} onSuccess={onSuccess} />
    default:
      return null
  }
}

export const StudentForm: React.FC<FormProps> = ({ onCancel, onSuccess }) => {
  // rest of the component code
  const groupQuery = trpc.getGroup.useQuery()
  const createStudent = trpc.createStudent.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      student_id: '',
      name: '',
      course: '',
      groupId: '',
    },
    validationSchema: zCreateStudentTrpcInput,
    onSubmit: async (values) => {
      await createStudent.mutateAsync(values)
      onSuccess()
    },
    successMessage: 'Студент успешно зарегистрирован',
    showValidationAlert: true,
  })

  return (
    <Segment title="Новый студент">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input name="student_id" label="ID студента" listlabel="Введите ID студента " formik={formik} />
          <Input name="name" label="ФИО" listlabel="Введите ФИО студента " formik={formik} />
          <Input name="course" bottoms={['1', '2', '3', '4']} label="Курс" listlabel="Выберите курс " formik={formik} />
          {groupQuery.data && (
            <List
              name="groupId"
              label="Группа"
              listlabel="Выберите группу"
              groups={groupQuery.data.Group || []}
              formik={formik}
              maxWidth={200}
            />
          )}
          <Alert { ...alertProps} />
          <div className={css.formActions}>
            <button type="button" onClick={onCancel} className={css.cancelButton}>
              Отмена
            </button>
            <ButtonSend { ...buttonProps} className={css.submitButton}>Зарегистрировать</ButtonSend>
          </div>
        </FormItems>
      </form>
    </Segment>
  )
}

export const GroupForm: React.FC<FormProps> = ({ onCancel, onSuccess }) => {
  // rest of the component code
  const departmentQuery = trpc.getDepartment.useQuery()
  const createGroup = trpc.createGroup.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: '',
      departmentId: '',
    },
    validationSchema: zCreateGroupTrpcInput,
    onSubmit: async (values) => {
      await createGroup.mutateAsync(values)
      onSuccess()
    },
    successMessage: 'Группа успешно создана',
    showValidationAlert: true,
  })

  return (
    <Segment title="Новая группа">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input name="name" label="Название группы" listlabel="Введите название группы " formik={formik} />

          {departmentQuery.data && (
            <List
              name="departmentId"
              label="Кафедра"
              listlabel="Выберите кафедру"
              groups={departmentQuery.data.Department || []}
              formik={formik}
              maxWidth={200}
            />
          )}
          <Alert { ...alertProps} />
          <div className={css.formActions}>
            <button type="button" onClick={onCancel} className={css.cancelButton}>
              Отмена
            </button>
            <ButtonSend { ...buttonProps} className={css.submitButton}>Создать</ButtonSend>
          </div>
        </FormItems>
      </form>
    </Segment>
  )
}

export const DepartmentForm: React.FC<FormProps> = ({ onCancel, onSuccess }) => {
  // rest of the component code
  const facultyQuery = trpc.getFaculty.useQuery()
  const createDepartment = trpc.createDepartment.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: '',
      facultyId: '',
    },
    validationSchema: zCreateDepartmentTrpcInput,
    onSubmit: async (values) => {
      await createDepartment.mutateAsync(values)
      onSuccess()
    },
    successMessage: 'Кафедра успешно создана',
    showValidationAlert: true,
  })

  return (
    <Segment title="Новая кафедра">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input name="name" label="Название кафедры" listlabel="Введите название кафедры " formik={formik} />

          {facultyQuery.data && (
            <List
              name="facultyId"
              label="Факультет"
              listlabel="Выберите факультет"
              groups={facultyQuery.data.Faculty || []}
              formik={formik}
              maxWidth={200}
            />
          )}
          <Alert { ...alertProps} />
          <div className={css.formActions}>
            <button type="button" onClick={onCancel} className={css.cancelButton}>
              Отмена
            </button>
            <ButtonSend { ...buttonProps} className={css.submitButton}>Создать</ButtonSend>
          </div>
        </FormItems>
      </form>
    </Segment>
  )
}

export const FacultyForm: React.FC<FormProps> = ({ onCancel, onSuccess }) => {
  const createFaculty = trpc.createFaculty.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: '',
    },
    validationSchema: zCreateFacultyTrpcInput,
    onSubmit: async (values) => {
      await createFaculty.mutateAsync(values)
      onSuccess()
    },
    successMessage: 'Факультет успешно создан',
    showValidationAlert: true,
  })

  return (
    <Segment title="Новый факультет">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input name="name" label="Название факультета" listlabel="Введите название факультета " formik={formik} />

          <Alert {...alertProps} />
          <div className={css.formActions}>
            <button type="button" onClick={onCancel} className={css.cancelButton}>
              Отмена
            </button>
            <ButtonSend { ...buttonProps} className={css.submitButton}>Создать</ButtonSend>
          </div>
        </FormItems>
      </form>
    </Segment>
  )
}

export const StaffForm: React.FC<FormProps> = ({ onCancel, onSuccess }) => {
  const createStaff = trpc.signUp.useMutation();
  const me = useMe();
  
  // Проверяем, является ли пользователь администратором
  const isAdmin = me?.nick === 'admin'; // Предполагается, что у пользователя есть поле role
  
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      nick: '',
      password: '',
      passwordAgain: '',
    },
    validationSchema: zSignUpTrpcInput
      .extend({
        passwordAgain: z.string().min(1, 'Подтверждение пароля обязательно'),
      })
      .superRefine((val, ctx) => {
        if (val.password !== val.passwordAgain) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Пароли не совпадают',
            path: ['passwordAgain'],
          });
        }
      }),
    onSubmit: async (values) => {
      const { passwordAgain,  ...staffData } = values;
      await createStaff.mutateAsync(staffData);
      onSuccess();
    },
    successMessage: 'Сотрудник успешно создан',
    showValidationAlert: true,
  });

  // Если пользователь не администратор, показываем сообщение об ошибке
  if (!isAdmin) {
    return (
      <Segment title="Доступ запрещен">
        <p>У вас нет прав для создания сотрудников. Только администраторы могут выполнять это действие.</p>
      </Segment>
    );
  }

  return (
    <Segment title="Новый сотрудник">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input 
            label="Имя пользователя" 
            name="nick" 
            formik={formik} 
            listlabel="Введите имя пользователя"
          />
          <Input 
            label="Пароль" 
            name="password" 
            type="password" 
            formik={formik} 
            listlabel="Введите пароль"
          />
          <Input 
            label="Подтверждение пароля" 
            name="passwordAgain" 
            type="password" 
            formik={formik} 
            listlabel="Подтвердите пароль"
          />
          <Alert { ...alertProps} />
          <div className={css.formActions}>
            <button 
              type="button" 
              onClick={onCancel} 
              className={css.cancelButton}
            >
              Отмена
            </button>
            <ButtonSend { ...buttonProps} className={css.submitButton}>Создать сотрудника</ButtonSend>
          </div>
        </FormItems>
      </form>
    </Segment>
  );
};