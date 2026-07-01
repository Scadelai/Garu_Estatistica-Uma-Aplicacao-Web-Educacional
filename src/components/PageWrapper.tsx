import type { ReactNode } from 'react';
import { Container, Title, Text, Group, Avatar } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import { findFolderByPath, findAppByPath } from '../data/navigation';
import AppBreadcrumb from './AppBreadcrumb';
import FloatingNav from './FloatingNav';

interface PageWrapperProps {
  children: ReactNode;
  /** Override the title (defaults to the app name from navigation data) */
  title?: string;
  /** Override the category color */
  color?: string;
  /** Additional description below the title */
  description?: string;
  /** Container size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function PageWrapper({ children, title, color, description, size = 'lg' }: PageWrapperProps) {
  const location = useLocation();
  const folder = findFolderByPath(location.pathname);
  const app = findAppByPath(location.pathname);

  const resolvedColor = color || folder?.color || 'cyan';
  const resolvedTitle = title || app?.name || 'GARU Estatística';
  const AppIcon = app?.icon;

  return (
    <div className="page-wrapper">
      <Container size={size} py="xl">
        <AppBreadcrumb />

        <Group mb="md" gap="md" align="center">
          {AppIcon && (
            <Avatar size={48} radius="xl" color={resolvedColor} variant="light">
              <AppIcon size={26} stroke={1.5} />
            </Avatar>
          )}
          <div>
            <Title order={2} fw={700} c={`${resolvedColor}.7`}>
              {resolvedTitle}
            </Title>
            {description && (
              <Text size="sm" c="dimmed" mt={2}>
                {description}
              </Text>
            )}
          </div>
        </Group>

        {children}
      </Container>

      <FloatingNav />
    </div>
  );
}
