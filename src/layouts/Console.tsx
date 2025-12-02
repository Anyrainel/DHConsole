import * as React from 'react';
import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import ServerToolbarActions from '../components/ServerToolbarActions';
import { PlayerProvider } from '../store/playerContext';
import LanguageSidebarFooter from '../components/LanguageSidebarFooter';
import { DialogsProvider } from '@toolpad/core/useDialogs';
import { SnackbarProvider } from '../store/SnackbarContext';

export default function Layout() {
  return (
    <DialogsProvider>
      <SnackbarProvider>
        <PlayerProvider>
          <DashboardLayout slots={{ toolbarActions: ServerToolbarActions, sidebarFooter: LanguageSidebarFooter }} sidebarExpandedWidth={260}>
            <PageContainer>
              <Outlet />
            </PageContainer>
          </DashboardLayout>
        </PlayerProvider>
      </SnackbarProvider>
    </DialogsProvider>
  );
}
