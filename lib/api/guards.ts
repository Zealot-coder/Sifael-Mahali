import { getOwnerSessionUser } from './auth';
import { apiError } from './http';

export async function requireOwner() {
  const user = await getOwnerSessionUser();
  if (!user) {
    return {
      user: null,
      errorResponse: apiError(401, 'UNAUTHORIZED', 'Owner authentication required.')
    };
  }

  return {
    user,
    errorResponse: null
  };
}
