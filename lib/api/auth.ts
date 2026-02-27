import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getOwnerSessionUser() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}
