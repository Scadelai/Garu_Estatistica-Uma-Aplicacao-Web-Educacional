import { ActionIcon, Tooltip, Transition } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FloatingNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home page
  if (location.pathname === '/') return null;

  return (
    <Transition mounted transition="slide-up" duration={300}>
      {(styles) => (
        <Tooltip label="Voltar à Home" position="left" withArrow>
          <ActionIcon
            id="floating-home-btn"
            size={56}
            radius="xl"
            variant="filled"
            color="cyan"
            aria-label="Voltar à Home"
            onClick={() => navigate('/')}
            style={{
              ...styles,
              position: 'fixed',
              bottom: 28,
              right: 28,
              zIndex: 1000,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            className="floating-nav-btn"
          >
            <IconHome size={26} stroke={1.8} />
          </ActionIcon>
        </Tooltip>
      )}
    </Transition>
  );
}
