'use server'
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}

const Admin = async () => {
  const supabase = await createClient();
  const {data: user} = await supabase.auth.getUser();
  const {data: session} = await supabase.auth.getSession();

  console.log(session);
  return (
    <form action={logout}>
      <h1>ADMIN {user?.user?.email}</h1>
      <Button type="submit">logout</Button>
    </form>
  );
}

export default Admin