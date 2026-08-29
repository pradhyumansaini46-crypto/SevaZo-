'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, LogOut, Sparkles } from 'lucide-react';

import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { sidebarNavConfig, NavItem } from './sidebar-nav-config';

function NavCollapsibleGroup({
  item,
  isActive,
  isGroupActive,
}: {
  item: NavItem;
  isActive: (url?: string) => boolean;
  isGroupActive: (items?: NavItem[]) => boolean;
}) {
  const active = isGroupActive(item.children);
  const [open, setOpen] = React.useState(active);

  React.useEffect(() => {
    if (active) {
      setOpen(true);
    }
  }, [active]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              tooltip={item.title}
              className={`hover:bg-gradient-to-r hover:from-[#E3FDF5]/80 hover:to-[#FFE6FA]/80 text-slate-700 hover:text-slate-950 transition-all ${
                active ? 'font-semibold text-slate-900 bg-gradient-to-r from-[#E3FDF5] to-[#FFE6FA] shadow-xs border border-white/60' : ''
              }`}
            >
              {item.icon && <item.icon className="size-4 text-teal-800" />}
              <span className="font-medium">{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[open]/collapsible:rotate-90 group-data-[state=open]/collapsible:rotate-90 text-slate-500" />
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent>
          <SidebarMenuSub className="border-l-slate-200">
            {item.children?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  isActive={isActive(subItem.url)}
                  className={`transition-all rounded-lg text-slate-700 ${
                    isActive(subItem.url)
                      ? 'bg-gradient-to-r from-[#E3FDF5] to-[#FFE6FA] font-semibold text-slate-950 shadow-xs border border-white/80'
                      : 'hover:bg-gradient-to-r hover:from-[#E3FDF5]/60 hover:to-[#FFE6FA]/60 hover:text-slate-950'
                  }`}
                  render={<Link href={subItem.url || '#'} prefetch={true} />}
                >
                  <span>{subItem.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = React.useCallback(
    (url?: string) => {
      if (!url) return false;
      if (url === '/dashboard') return pathname === '/dashboard';
      return pathname.startsWith(url);
    },
    [pathname]
  );

  const isGroupActive = React.useCallback(
    (items?: NavItem[]) => {
      if (!items) return false;
      return items.some((item) => isActive(item.url));
    },
    [isActive]
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-white/80 bg-white/95 backdrop-blur-xl text-slate-900 shadow-sm" {...props}>
      <SidebarHeader className="border-b border-slate-100 pb-3 bg-white/95">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" prefetch={true} />}>
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-white border border-orange-100 shadow-xs overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Sevazo Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight text-base text-slate-900">
                  Sevazo
                </span>
                <span className="truncate text-xs font-medium text-slate-500">
                  Admin Command Portal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white/95">
        {sidebarNavConfig.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (item.children) {
                    return (
                      <NavCollapsibleGroup
                        key={item.title}
                        item={item}
                        isActive={isActive}
                        isGroupActive={isGroupActive}
                      />
                    );
                  }

                  const active = isActive(item.url);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.title}
                        className={`transition-all rounded-lg text-slate-700 ${
                          active
                            ? 'bg-gradient-to-r from-[#E3FDF5] to-[#FFE6FA] font-semibold text-slate-950 shadow-xs border border-white/80'
                            : 'hover:bg-gradient-to-r hover:from-[#E3FDF5]/60 hover:to-[#FFE6FA]/60 hover:text-slate-950'
                        }`}
                        render={<Link href={item.url || '#'} prefetch={true} />}
                      >
                        {item.icon && <item.icon className="size-4 text-teal-800" />}
                        <span className="font-medium">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 pt-2 bg-white/95">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg" className="hover:bg-gradient-to-r hover:from-[#E3FDF5]/70 hover:to-[#FFE6FA]/70 text-slate-800">
                    <Avatar className="size-8 rounded-lg ring-1 ring-slate-200">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#E3FDF5] to-[#FFE6FA] font-bold text-slate-900 text-xs">
                        SA
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-slate-900">Super Admin</span>
                      <span className="truncate text-xs text-slate-500">
                        admin@sevazo.com
                      </span>
                    </div>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                className="w-56 bg-white border border-slate-200 shadow-md text-slate-900"
                side="top"
                align="start"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/settings" prefetch={true} />}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
