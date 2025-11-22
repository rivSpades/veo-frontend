import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({ collapsed: false, toggleCollapsed: () => {}, isMobileOpen: false, toggleMobile: () => {} });

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapsed = () => setCollapsed(!collapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, isMobileOpen, toggleMobile }}>
      <div className="flex min-h-screen w-full overflow-x-hidden max-w-full">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function Sidebar({ children, ...props }) {
  const { collapsed, isMobileOpen, toggleMobile } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40 hidden md:flex`}
        {...props}
      >
        {children}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-50 md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        {...props}
      >
        {children}
      </aside>
    </>
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

export function SidebarMenuButton({ children, asChild, isActive, className = '', onClick, ...props }) {
  if (asChild) {
    return <div className={className}>{children}</div>;
  }

  return (
    <button className={`w-full text-left ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export function SidebarInset({ children }) {
  const { collapsed } = useSidebar();

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full max-w-full overflow-x-hidden ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
      {children}
    </div>
  );
}

export function SidebarRail() {
  return null;
}
