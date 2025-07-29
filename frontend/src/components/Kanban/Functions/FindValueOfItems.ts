import { UniqueIdentifier } from '@dnd-kit/core';
import { JSX } from 'react';
import { DNDType } from '../Kanban';

type FindValueOfItemsProps = {
  id: UniqueIdentifier | undefined
  type: 'container' | 'item'
  container: DNDType[]
};

export default function findValueOfItems({ id, type, container }: FindValueOfItemsProps) {
  if (!id) return null;

  if (type === 'container') {
    return container.find((c) => c.id === id);
  }

  if (type === 'item') {
    return container.find((c) => c.items.find((item) => item.id === id));
  }

  return null;
}
