import React from 'react';
import { SidebarInset, SidebarProvider } from '../ui/Sidebar';
import { AppSidebar } from './AppSidebar';
import { DashboardHeader } from './DashboardHeader';

/**
 * DashboardLayout - Main layout wrapper for dashboard pages
 * @param {ReactNode} children - Page content
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle
 * @param {ReactNode} action - Custom action buttons
 * @param {boolean} showNotifications - Show notification bell
 * @param {boolean} showSettings - Show settings button
 * @param {boolean} showHelp - Show help button
 * @param {object} user - User data
 */
export function DashboardLayout({
  children,
  title,
  subtitle,
  action,
  showNotifications = true,
  showSettings = false,
  showHelp = false,
  user,
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          action={action}
          showNotifications={showNotifications}
          showSettings={showSettings}
          showHelp={showHelp}
          user={user}
        />

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 overflow-y-auto px-4 md:px-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
