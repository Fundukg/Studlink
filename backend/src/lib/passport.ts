// auth.ts (или твой файл инициализации passport)
import { type Express } from 'express'
import { Passport } from 'passport'
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt'
import { env } from '../lib/env'
import { type AppContext } from './ctx'

export const applyPassportToExpressApp = (
  expressApp: Express,
  ctx: AppContext
): void => {
  const passport = new Passport()

  passport.use(
    new JWTStrategy(
      {
        secretOrKey: env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      },
      (jwtPayload: string, done) => {
        // Находим пользователя в единой таблице User по ID из JWT
        ctx.prisma.user
          .findUnique({
            where: { id: jwtPayload },
            // Сразу подтягиваем специфичные профили, если они есть,
            // чтобы роуты и tRPC-процедуры могли использовать эти данные
            include: {
              studentProfile: true,
              teacherProfile: true,
            },
          })
          .then((user) => {
            if (!user) {
              done(null, false)
              return
            }
            // Передаем объект user (теперь он содержит поля id, role, lastName и т.д.)
            done(null, user)
          })
          .catch((error) => {
            done(error, false)
          })
      }
    )
  )

  expressApp.use((req, res, next) => {
    if (!req.headers.authorization) {
      next()
      return
    }
    passport.authenticate('jwt', { session: false }, (...args: any[]) => {
      // Кладём объект авторизованного User в req.user
      req.user = args[1] || undefined
      next()
    })(req, res, next)
  })
}
