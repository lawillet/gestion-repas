'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  CircleUser, 
  Menu,
  Moon,
  Package2,
  Search, 
  Sun,
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '/admin/addadmin', label: 'Ajouter Admin' },
  { href: '/admin/alluser', label: 'Utilisateurs' },
  { href: '/admin/disabledday', label: 'Bloquer Réservation' },
  { href: '/admin/price', label: 'Prix' },
  { href: '/admin/reservation', label: 'Réservations' },

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
          href='/admin'
          className='flex items-center gap-2 text-lg font-semibold md:text-base'
        >
          <Image
            src='/Cerfontaine_logo.svg'
            alt='Le logo de la ville de Cerfontaine'
            width={50}
            height={50}
            className='h-20 w-20 object-contain'
          />
        </Link>
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'transition-colors hover:text-foreground text-muted-foreground',
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
        <SheetContent side='left'>
          <nav className='grid gap-6 text-lg font-medium'>
            <Link
              href='/'
              className='flex items-center gap-2 text-lg font-semibold'
            >
            <Image
              src='/Cerfontaine_logo.svg'
              alt='Le logo de la ville de Cerfontaine'
              width={50}
              height={50}
              className='h-20 w-20 object-contain pt-4'
            />
            </Link>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn('hover:text-foreground text-muted-foreground', {
                  'text-foreground font-bold': pathname === href,
                })}
              >
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
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
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
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
          Se déconnecter
        </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
