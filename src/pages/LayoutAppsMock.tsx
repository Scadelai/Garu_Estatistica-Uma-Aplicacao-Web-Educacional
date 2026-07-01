import { useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Text, Avatar, Group, Center, Button, LoadingOverlay, Image } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { folders, standaloneItems } from '../data/navigation';
import garuLogo from '../assets/images/garu_3.png';

function getInitialFolder(location: ReturnType<typeof useLocation>): string | null {
  const state = location.state as { openFolder?: string } | null;
  if (state?.openFolder) {
    // Clear state so refresh doesn't re-open
    window.history.replaceState({}, '');
    return state.openFolder;
  }
  return null;
}

export default function LayoutAppsMock() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(() => getInitialFolder(location));
  const [isNavigating, setIsNavigating] = useState(false);

  const activeFolder = folders.find(f => f.id === activeFolderId);

  const handleNavigate = (path: string) => {
    setIsNavigating(true);
    setTimeout(() => navigate(path), 20); // Small timeout to allow React to paint the LoadingOverlay
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      backgroundImage: 'radial-gradient(rgba(0, 210, 211, 0.08) 1.5px, transparent 1.5px)',
      backgroundSize: '28px 28px',
    }}>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animated-view {
          animation: fadeInScale 0.35s ease-out forwards;
        }
        .folder-card {
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          border-top: 4px solid var(--folder-color, transparent);
          border-top-left-radius: 4px;
        }
        .folder-card::before {
          content: "";
          position: absolute;
          top: -14px;
          left: -4px;
          width: 50px;
          height: 14px;
          background-color: var(--folder-color, transparent);
          border-top-left-radius: 8px;
          border-top-right-radius: 14px;
          transition: all 0.25s ease;
        }
        .folder-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        .folder-card:focus-visible {
          outline: 3px solid var(--mantine-color-blue-5);
          outline-offset: 4px;
        }
        .app-card {
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .app-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
        }
        .app-card:focus-visible {
          outline: 3px solid var(--mantine-color-blue-5);
          outline-offset: 4px;
        }
        .standalone-card {
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .standalone-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
        }
        .standalone-card:focus-visible {
          outline: 3px solid var(--mantine-color-blue-5);
          outline-offset: 4px;
        }
      `}</style>
      <Container size="lg" py={48}>
        <Center mb="xl" mt="md" style={{ flexDirection: 'column' }}>
          <Title
            order={1}
            mb="xs"
            c={activeFolder ? `${activeFolder.color}.7` : undefined}
            style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}
          >
            {activeFolder ? activeFolder.name : <Image src={garuLogo} alt="GARU Estatística" maw={300} mx="auto" />}
          </Title>
          <Text c="dimmed" size="lg" ta="center" maw={600} lh={1.5}>
            {activeFolder
              ? activeFolder.description
              : 'Selecione uma categoria abaixo para explorar.'}
          </Text>
        </Center>

        <div key={activeFolderId || 'root'} className="animated-view">
          <LoadingOverlay visible={isNavigating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
          {activeFolder ? (
            <>
              <Center mb="xl">
                <Button
                  variant="subtle"
                  color="gray"
                  size="md"
                  leftSection={<IconArrowLeft size={18} />}
                  onClick={() => setActiveFolderId(null)}
                >
                  Voltar às Categorias
                </Button>
              </Center>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {activeFolder.apps.map((app) => (
                  <Paper
                    key={app.name}
                    shadow="sm"
                    p="xl"
                    radius="lg"
                    withBorder
                    onClick={() => handleNavigate(app.path)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate(app.path);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className="app-card"
                    style={{
                      borderTop: `4px solid var(--mantine-color-${app.color}-6)`,
                    }}
                  >
                    <Group justify="center" mb="md">
                      <Avatar size={70} radius="xl" color={app.color} variant="light">
                        <app.icon size={38} stroke={1.5} />
                      </Avatar>
                    </Group>
                    <Title order={4} ta="center" fw={600} mt="sm">
                      {app.name}
                    </Title>
                  </Paper>
                ))}
              </SimpleGrid>
            </>
          ) : (
            <>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {folders.slice(0, 4).map((folder) => (
                  <Paper
                    key={folder.id}
                    shadow="sm"
                    p="xl"
                    radius="lg"
                    withBorder
                    onClick={() => setActiveFolderId(folder.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveFolderId(folder.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className="folder-card"
                    style={{ '--folder-color': `var(--mantine-color-${folder.color}-6)` } as React.CSSProperties}
                  >
                    <Group justify="center" mb="md" style={{ position: 'relative' }}>
                      <Avatar size={80} radius="xl" color={folder.color} variant="filled">
                        <folder.icon size={42} stroke={1.5} />
                      </Avatar>
                    </Group>
                    <Title order={3} ta="center" fw={600} mt="xs" c={`${folder.color}.7`}>
                      {folder.name}
                    </Title>
                    <Text ta="center" size="sm" c="dimmed" mt="sm" lh={1.4}>
                      {folder.description}
                    </Text>
                  </Paper>
                ))}

                {standaloneItems.map((item) => (
                  <Paper
                    key={item.path}
                    shadow="sm"
                    p="xl"
                    radius="lg"
                    withBorder
                    onClick={() => handleNavigate(item.path)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate(item.path);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className="standalone-card"
                    style={{
                      borderTop: `4px solid var(--mantine-color-${item.color}-6)`,
                    }}
                  >
                    <Group justify="center" mb="md" style={{ position: 'relative' }}>
                      <Avatar size={80} radius="xl" color={item.color} variant="filled">
                        <item.icon size={42} stroke={1.5} />
                      </Avatar>
                    </Group>
                    <Title order={3} ta="center" fw={600} mt="xs" c={`${item.color}.7`}>
                      {item.name}
                    </Title>
                    <Text ta="center" size="sm" c="dimmed" mt="sm" lh={1.4}>
                      {item.description}
                    </Text>
                  </Paper>
                ))}

                {folders.slice(4).map((folder) => (
                  <Paper
                    key={folder.id}
                    shadow="sm"
                    p="xl"
                    radius="lg"
                    withBorder
                    onClick={() => setActiveFolderId(folder.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveFolderId(folder.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className="folder-card"
                    style={{ '--folder-color': `var(--mantine-color-${folder.color}-6)` } as React.CSSProperties}
                  >
                    <Group justify="center" mb="md" style={{ position: 'relative' }}>
                      <Avatar size={80} radius="xl" color={folder.color} variant="filled">
                        <folder.icon size={42} stroke={1.5} />
                      </Avatar>
                    </Group>
                    <Title order={3} ta="center" fw={600} mt="xs" c={`${folder.color}.7`}>
                      {folder.name}
                    </Title>
                    <Text ta="center" size="sm" c="dimmed" mt="sm" lh={1.4}>
                      {folder.description}
                    </Text>
                  </Paper>
                ))}
              </SimpleGrid>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
