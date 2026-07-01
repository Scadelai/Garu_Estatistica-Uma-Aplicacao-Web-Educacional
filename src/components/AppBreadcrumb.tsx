import { Breadcrumbs, Anchor, Text } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { findFolderByPath, findAppByPath } from '../data/navigation';

export default function AppBreadcrumb() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home page
  if (location.pathname === '/') return null;

  const folder = findFolderByPath(location.pathname);
  const app = findAppByPath(location.pathname);

  const items = [
    <Anchor
      key="home"
      onClick={() => navigate('/')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/');
        }
      }}
      tabIndex={0}
      role="button"
      className="breadcrumb-item"
      size="sm"
      c="dimmed"
      style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
    >
      <IconHome size={14} />
      Home
    </Anchor>,
  ];

  if (folder) {
    items.push(
      <Anchor
        key="folder"
        onClick={() => navigate('/', { state: { openFolder: folder.id } })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/', { state: { openFolder: folder.id } });
          }
        }}
        tabIndex={0}
        role="button"
        className="breadcrumb-item"
        size="sm"
        c={`${folder.color}.6`}
        fw={500}
        style={{ cursor: 'pointer' }}
      >
        {folder.name}
      </Anchor>
    );
  }

  if (app) {
    items.push(
      <Text key="app" size="sm" fw={600} c="dark">
        {app.name}
      </Text>
    );
  }

  return (
    <>
      <style>{`
        .breadcrumb-item:focus-visible {
          outline: 2px solid var(--mantine-color-blue-5);
          outline-offset: 4px;
          border-radius: 4px;
        }
      `}</style>
      <Breadcrumbs
        mb="lg"
        styles={{
          root: { flexWrap: 'wrap' },
          separator: { color: 'var(--mantine-color-gray-4)' },
        }}
      >
        {items}
      </Breadcrumbs>
    </>
  );
}
