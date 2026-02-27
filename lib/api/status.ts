export function statusFromErrorCode(code: string) {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 400;
    case '23505':
      return 409;
    case '42501':
      return 403;
    case 'PGRST116':
      return 404;
    default:
      return 500;
  }
}
