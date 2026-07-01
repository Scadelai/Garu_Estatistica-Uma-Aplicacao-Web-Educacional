import { useRef } from 'react';
import { Text, ActionIcon, Stack, Group } from '@mantine/core';
import { IconArrowUp, IconArrowDown, IconEye, IconEyeOff } from '@tabler/icons-react';
import { COLORFUL } from '../../utils/colors';

interface CategoryOrderControlProps {
  order: string[];
  hiddenCategories?: string[];
  onChange: (newOrder: string[]) => void;
  onToggleHide?: (cat: string) => void;
  title?: string;
  useColors?: boolean;
}

export function CategoryOrderControl({ order, hiddenCategories = [], onChange, onToggleHide, useColors = true }: CategoryOrderControlProps) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newOrder = [...order];
      const dragged = newOrder.splice(dragItem.current, 1)[0];
      newOrder.splice(dragOverItem.current, 0, dragged);
      onChange(newOrder);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...order];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    onChange(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    onChange(newOrder);
  };

  return (
    <Stack gap="xs" mt="sm" mb="md">
      {order.map((cat, idx) => {
        const isHidden = hiddenCategories.includes(cat);
        return (
          <Group 
            key={cat} 
            draggable 
            onDragStart={() => dragItem.current = idx}
            onDragEnter={() => dragOverItem.current = idx}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
            wrap="nowrap"
            style={{ 
              cursor: 'grab', 
              border: '1px solid #eee', 
              padding: '4px 8px', 
              borderRadius: 4, 
              background: isHidden ? '#f8f9fa' : '#fff',
              opacity: isHidden ? 0.6 : 1
            }}
          >
            {useColors && <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORFUL[idx % COLORFUL.length], opacity: isHidden ? 0.3 : 1 }} />}
            <Text size="sm" c={isHidden ? 'dimmed' : undefined} style={{ flex: 1, userSelect: 'none', textDecoration: isHidden ? 'line-through' : 'none' }} truncate>{cat}</Text>
            <Group gap={0}>
              {onToggleHide && (
                <ActionIcon size="sm" variant="subtle" onClick={() => onToggleHide(cat)} title={isHidden ? "Mostrar categoria nos cálculos" : "Esconder categoria dos cálculos"}>
                  {isHidden ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                </ActionIcon>
              )}
              <ActionIcon size="sm" variant="subtle" onClick={() => moveUp(idx)} disabled={idx === 0}><IconArrowUp size={14} /></ActionIcon>
              <ActionIcon size="sm" variant="subtle" onClick={() => moveDown(idx)} disabled={idx === order.length - 1}><IconArrowDown size={14} /></ActionIcon>
            </Group>
          </Group>
        );
      })}
    </Stack>
  );
}
