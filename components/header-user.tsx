'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  CircleUser, 
  Menu,
  Moon,
  Sun,
  LogOutIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/user', label: 'Réserver' },
  { href: '/user/addChild', label: 'Ajouter un enfant' },
  { href: '/user/account', label: 'Mes enfants' },
  { href: '/user/myReservation', label: 'Mes Réservations' },

];

export const Header = () => {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth'); 
  };

  return (
    <header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6'>
      <nav className='hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6'>
        <Link
          href='/user'
          className='flex items-center gap-2 text-lg font-semibold md:text-base'
        >
          
        </Link>
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'whitespace-nowrap transition-colors hover:text-foreground text-muted-foreground ',
              {
                'text-foreground font-bold': pathname === href,
              }
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger
          render={
            <Button variant='outline' size='icon' className='shrink-0 md:hidden'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle navigation menu</span>
            </Button>
          }
        />
       
      </Sheet>
      <div className='flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4'>
        <form className='ml-auto flex-1 sm:flex-initial'>
          <div className='relative'>
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant='secondary' size='icon' className='rounded-full h-7.5 w-7.5'>
                <CircleUser className='h-5 w-5' />
                <span className='sr-only'>Toggle user menu</span>
              </Button>
            }
          />
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun />
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon  />
          Sombre
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOutIcon />
          Déconnexion
        </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
