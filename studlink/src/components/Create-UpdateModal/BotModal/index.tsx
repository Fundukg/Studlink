import { useFormik } from 'formik'
import { z } from 'zod'
import { trpc } from '../../../lib/trpc'
import { Input } from '../../Input'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

// Схема валидации
const botSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  platform: z.string().min(1, 'Выберите платформу'),
  token: z.string().min(10, 'Слишком короткий токен'),
})

type BotModalProps = {
  isOpen: boolean
  onClose: () => void
  bot?: any // Если передано, значит это редактирование
}

export const BotModal = ({ isOpen, onClose, bot }: BotModalProps) => {
  const utils = trpc.useUtils()
  const isEdit = !!bot

  const createMutation = trpc.createBot.useMutation()
  const updateMutation = trpc.updateBot.useMutation()

  const formik = useFormik({
    initialValues: {
      name: bot?.name || '',
      platform: bot?.platform || 'TELEGRAM',
      token: bot?.token || '',
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = botSchema.safeParse(values)
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
            id: bot.id,
            ...values,
            settings: bot.settings || {},
          })
        } else {
          await createMutation.mutateAsync({
            ...values,
            settings: {},
          })
        }

        utils.getBots.invalidate()
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
      title={isEdit ? 'Настройки бота' : 'Добавить нового бота'}
      maxWidth={500}
      footer={
        <div className={css.modalFooter}>
          <button className={css.cancelBtn} onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={css.submitBtn}
            form="bot-form"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {isEdit ? 'Сохранить изменения' : 'Подключить бота'}
          </button>
        </div>
      }
    >
      <form
        id="bot-form"
        onSubmit={formik.handleSubmit}
        className={css.modalForm}
      >
        <Input
          name="name"
          label="Название (для панели)"
          placeholder="Например: Главный учебный бот"
          formik={formik}
        />

        <div className={css.inputGroup}>
          <label className={css.label}>Платформа</label>
          <select
            name="platform"
            className={`${css.selectField} ${
              formik.errors.platform && formik.touched.platform
                ? css.errorInput
                : ''
            }`}
            value={formik.values.platform}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isEdit} // Платформу обычно менять нельзя после создания
          >
            <option value="TELEGRAM">Telegram</option>
            <option value="VK">ВКонтакте (недоступно)</option>
            <option value="WHATSAPP">WhatsApp (недоступно)</option>
          </select>
          {isEdit && (
            <small className={css.hint}>
              Платформу нельзя изменить после создания
            </small>
          )}
          {formik.errors.platform && formik.touched.platform && (
            <div className={css.errorText}>
              {formik.errors.platform as string}
            </div>
          )}
        </div>

        <Input
          name="token"
          label="API Токен платформы"
          placeholder="Вставьте токен, полученный от BotFather"
          formik={formik}
        />

        <div className={css.infoBox}>
          <p>
            Убедитесь, что у бота включен <b>Privacy Mode</b>, если вы
            планируете использовать его в общих группах.
          </p>
        </div>
      </form>
    </UniversalModal>
  )
}
