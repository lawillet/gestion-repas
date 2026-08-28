import { ADMIN } from "@/constants/constants";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function RootLayout({
    children}: 
    Readonly<{
        children : ReactNode;

}>){
    // check if the user is authenticated and if is an admin before display the page
    
    
    return <>
        {children}
    </>
}