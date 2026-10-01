import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";


const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})




export const metadata: Metadata = {
  title: "Gestion repas",
  description: "réserver et payer les repas de votre enfant"
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
    

    
  }
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider
         attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors/>
        </ThemeProvider>
      </body>
    </html>
  )
}
