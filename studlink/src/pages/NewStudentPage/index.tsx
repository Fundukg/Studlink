import { zCreateStudentTrpcInput } from "@parkstick/backend/src/router/createStudent/input";
import { Alert } from "../../components/Alert";
import { ButtonSend } from "../../components/Button";
import { FormItems } from "../../components/FormItems";
import { Input } from "../../components/Input";
import { Segment } from "../../components/Segment";
import { useForm } from "../../lib/form";
import { withPageWrapper } from "../../lib/pageWarpper";
import { trpc } from "../../lib/trpc";

    export const NewStudentsPage = withPageWrapper({
        authorizedOnly: true
    })(() => {
        const createStudent = trpc.createStudent.useMutation()
        const { formik, buttonProps, alertProps } = useForm({
            initialValues: {
                student_id: '',
                name: '',
                course: '',
                department: '',
                directions: '',
                group: '',
            },
            validationSchema: zCreateStudentTrpcInput,
            onSubmit: async(values) => {
                await createStudent.mutateAsync(values)
                formik.resetForm()
            },
            successMessage: 'Студент успешно зарегистрирован',
            showValidationAlert: true,
        })

        return (
            <Segment title="Новый студент">
                <form onSubmit={formik.handleSubmit}>
                    <FormItems>
                        <Input name="student_id" label="ID студента" formik={formik} />
                        <Input name="name" label="ФИО" formik={formik} />
                        <Input name="course" bottoms={['1', '2', '3', '4']} label="Курс" formik={formik} />
                        <Input name="department" bottoms={['ТТФ', 'ФЛиСХ']} label="Кафедра" formik={formik} />
                        <Input name="directions" bottoms={['ИСиТ']} label="Направление" formik={formik} />
                        <Input name="group" bottoms={['315', '325', '335', '345']} label="Группа" formik={formik} maxWidth={500} />
                        <Alert {...alertProps} />
                        <ButtonSend {...buttonProps}>Зарегистрировать</ButtonSend>
                    </FormItems>
                </form>
            </Segment>
        )
    })