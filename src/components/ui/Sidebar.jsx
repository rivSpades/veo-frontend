import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({ collapsed: false, toggleCollapsed: () => {} });

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      <div className="flex min-h-screen w-full">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function Sidebar({ children, ...props }) {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40`}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className = '', children }) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarContent({ className = '', children }) {
  return (
    <div className={`flex-1 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

export function SidebarGroup({ className = '', children }) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({ className = '', children }) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

export function SidebarGroupContent({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenu({ children }) {
  return <nav className="space-y-1">{children}</nav>;
}

export function SidebarMenuItem({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({ children, asChild, isActive, className = '' }) {
  if (asChild) {
    return <div className={className}>{children}</div>;
  }

  return (
    <button className={`w-full text-left ${className}`}>
      {children}
    </button>
  );
}

export function SidebarInset({ children }) {
  const { collapsed } = useSidebar();

  return (
    <div className={`flex-1 flex flex-col min-h-screen ${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
      {children}
    </div>
  );
}

export function SidebarRail() {
  return null;
}
