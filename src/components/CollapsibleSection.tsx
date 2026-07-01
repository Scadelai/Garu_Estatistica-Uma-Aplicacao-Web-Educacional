import { Anchor, Collapse, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';

interface CollapsibleSectionProps {
  title?: string;
  children: ReactNode;
}

export default function CollapsibleSection({ children }: CollapsibleSectionProps) {
  const [opened, { toggle }] = useDisclosure(false);
  return (
    <Box>
      <Anchor component="button" onClick={toggle} size="sm">
        {opened ? 'Mostrar menos' : 'Mostrar mais'}
      </Anchor>
      <Collapse in={opened}>
        <Box mt="xs">{children}</Box>
      </Collapse>
    </Box>
  );
}
