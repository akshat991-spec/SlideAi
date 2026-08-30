import { validationResult } from 'express-validator';

/**
 * Middleware: reads express-validator errors and returns a 422 response
 * if any validation failures exist. Otherwise calls next().
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}
