import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { ADMIN, USER } from "@/constants/constants"


export default async function Page() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData?.user) {
    redirect('/auth')
  }
    if (authData?.user) {
        const {data, error } = await supabase.from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
    if (error || !data ){
        console.log('error fetching user data', error)
        return;
    }
              
    // check type
    if( data.type === USER ) return redirect('/user');
    if( data.type === ADMIN ) return redirect('/admin');

    }
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">HOME PAGE</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
        
      </div>
    </div>
  )
}
