import { Header } from "@/components/header";
import { RenderMounted } from "@/components/render-mounted";
import { USER } from "@/constants/constants";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function RootLayout({
    children}: 
    Readonly<{
        children : ReactNode;

}>){
    // check if the user is authenticated and if is an admin before display the page
    
    const supabase = await createClient();
        
    const {data: authData} = await supabase.auth.getUser();
    
        if (authData?.user) {
            const {data, error } = await supabase.from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();
            if (error || !data ){
                console.log('error fetching user data', error)
                return;
            }
            
            // check if admin
            if( data.type === USER ) return redirect('/user')
        }

    return (
    <RenderMounted>
        <Header />
        {children}
    </RenderMounted>
    );
}