'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, index + 1).join('/'),
    isLast: index === segments.length - 1,
  }));
}

export function AppHeader() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/80 bg-white/80 backdrop-blur-md px-6 shadow-xs sticky top-0 z-30 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-slate-700 hover:bg-gradient-to-r hover:from-[#E3FDF5]/80 hover:to-[#FFE6FA]/80" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-slate-200" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="font-semibold text-slate-900">{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href} className="text-slate-500 hover:text-slate-950 font-medium">
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="http://localhost:3005"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#030014] text-cyan-400 border border-purple-500/40 shadow-xs hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>NeuroSync AI</span>
          <span className="text-[10px] text-purple-400 font-sans font-normal ml-0.5">v2.4 ↗</span>
        </a>
        <Button variant="ghost" size="icon" className="relative hover:bg-gradient-to-r hover:from-[#E3FDF5]/80 hover:to-[#FFE6FA]/80 rounded-full text-slate-700">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute -right-0.5 -top-0.5 h-4.5 w-4.5 rounded-full bg-gradient-to-br from-[#0d9488] to-[#c026d3] text-white p-0 text-[10px] font-bold flex items-center justify-center shadow-xs">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
