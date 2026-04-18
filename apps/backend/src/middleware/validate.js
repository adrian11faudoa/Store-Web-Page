import { ZodError } from 'zod'
import { AppError } from '../utils/app-error.js'

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      req.validated = req.validated || {}
      req.validated[source] = schema.parse(req[source])
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(422, 'Validation failed', error.flatten()))
      }

      return next(error)
    }
  }
}
