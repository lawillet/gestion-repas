'use server'
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation'
import { getChildren } from '@/actions/user';
import Link from 'next/link';

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}

const User = async () => {
  const supabase = await createClient();
  const {data: user} = await supabase.auth.getUser();
  //console.log(user?.user?.email);
  return (
    <>
      <h2>mes enfants</h2>
      {getChildren().then((children) => {
        if (children && children.length > 0) {
          return (
            <ul>
              {children.map((child) => (
                <li key={child.id}>
                  {child.name} {child.surname} - {child.schooling} <Link href={`/user/${child.id}`}>
            Commander pour {child.name}
          </Link>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <>
        <p>Vous avez pas enfants enregistrés.</p> 
        <Link href="/user/addChild">
        Ajouter un enfant
        </Link>
        </>);
      })}
    </>
  );
}

export default User