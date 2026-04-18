import { ZodError } from 'zod'

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) return next(error)
      next(error)
    }
  }
}
