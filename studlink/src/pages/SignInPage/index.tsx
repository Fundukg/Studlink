import { zSignInTrpcInput } from '@parkstick/backend/src/router/signIn/input'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiArrowRight } from 'react-icons/fi'
import { Alert } from '../../components/Alert'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const SignInPage = withPageWrapper({
  redirectAuthorized: true,
})(() => {
  const trpcUtils = trpc.useUtils()
  const signIn = trpc.signIn.useMutation()
  const [showPassword, setShowPassword] = useState(false)

  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      nick: '',
      password: '',
    },
    validationSchema: zSignInTrpcInput,
    onSubmit: async (values) => {
      const { token } = await signIn.mutateAsync(values)
      Cookies.set('token-studlink', token, { expires: 99999 })
      void trpcUtils.invalidate()
    },
    resetOnSuccess: false,
  })

  return (
    <div className={css.container}>
      <div className={css.content}>
        {/* Logo/Brand Section */}
        <div className={css.header}>
          <div className={css.logo}>
            <FiLogIn className={css.logoIcon} />
          </div>
          <h1 className={css.title}>Добро пожаловать</h1>
          <p className={css.subtitle}>Войдите в свою учетную запись</p>
        </div>

        {/* Login Form */}
        <div className={css.formCard}>
          <form onSubmit={formik.handleSubmit} className={css.form}>
            <Alert {...alertProps} />

            {/* Username Field */}
            <div className={css.formGroup}>
              <label htmlFor="nick" className={css.label}>
                Имя пользователя
              </label>
              <div className={css.inputContainer}>
                <div className={css.inputIcon}>
                  <FiMail />
                </div>
                <input
                  id="nick"
                  name="nick"
                  type="text"
                  value={formik.values.nick}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${css.input} ${formik.touched.nick && formik.errors.nick ? css.inputError : ''}`}
                  placeholder="Введите ваше имя пользователя"
                />
              </div>
              {formik.touched.nick && formik.errors.nick && <p className={css.error}>{formik.errors.nick}</p>}
            </div>

            {/* Password Field */}
            <div className={css.formGroup}>
              <label htmlFor="password" className={css.label}>
                Пароль
              </label>
              <div className={css.inputContainer}>
                <div className={css.inputIcon}>
                  <FiLock />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${css.input} ${formik.touched.password && formik.errors.password ? css.inputError : ''}`}
                  placeholder="Введите ваш пароль"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={css.passwordToggle}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className={css.error}>{formik.errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className={css.formOptions}>
              <label className={css.rememberMe}>
                <input type="checkbox" className={css.checkbox} />
                <span>Запомнить меня</span>
              </label>
              <a href="#" className={css.forgotPassword}>
                Забыли пароль?
              </a>
            </div>

            {/* Login Button */}
            <button type="submit" {...buttonProps} className={css.submitButton}>
              Войти
              <FiArrowRight className={css.buttonIcon} />
            </button>
          </form>

          {/* Sign Up Link */}
          <div className={css.footer}>
            <p>
              Нет аккаунта?{' '}
              <a href="#" className={css.link}>
                Зарегистрироваться
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={css.pageFooter}>
          <p>Защищено с помощью современного шифрования</p>
        </div>
      </div>
    </div>
  )
})
