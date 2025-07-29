import { UniqueIdentifier } from '@dnd-kit/core';
import { JSX } from 'react';

export default interface ContainerProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  title?: string;
  icon?: JSX.Element;
  description?: string;
  onAddItem?: () => void;
}