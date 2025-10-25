/**
 * @deprecated Use handleApiError from error-handler.ts for full error details
 * or getErrorMessage from error-handler.ts for simple message extraction
 */
export { getErrorMessage, handleApiError, formatValidationErrors, getFirstValidationError, getFieldErrors } from './error-handler'