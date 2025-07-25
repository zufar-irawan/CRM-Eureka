import React from 'react';
import ContainerProps from './Container.type';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { Button } from '../Button/Button';
import { GripHorizontal } from 'lucide-react';

const Container = ({
    id,
    children,
    title,
    icon,
    description,
    onAddItem,
}: ContainerProps) => {
    const {
        attributes,
        setNodeRef,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id,
        data: {
            type: 'container',
        },
    });
    return (
        <div
            {...attributes}
            ref={setNodeRef}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
            }}
            className={clsx(
                'w-full h-full p-4 bg-gray-50 rounded-xl flex flex-col gap-y-4',
                isDragging && 'opacity-50',
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-1">
                    <div className="flex flex-row gap-x-2 items-center">
                        {icon}
                        <h1 className="text-gray-800 text-md">{title}</h1>
                    </div>
                    <p className="text-gray-400 text-xs">{description}</p>
                </div>
                {/* <button
                    className="p-2 text-xs rounded-xl text-gray-500 group hover:bg-gray-100"
                    {...listeners}
                >
                    <GripHorizontal size={16} className='group-hover:text-gray-800' />
                </button> */}
            </div>

            {children}
            <Button variant="ghost" className='text-sm' onClick={onAddItem}>
                + New
            </Button>
        </div>
    );
};

export default Container;