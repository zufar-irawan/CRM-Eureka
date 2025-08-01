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
            className='w-full h-full min-w-[260px] max-w-[260px] rounded-xl hover:bg-gray-50 bg-white flex flex-col'
        >
            <div className="flex items-center py-4 px-2 justify-between">
                <div className="w-full flex flex-col gap-y-1">
                    <div className="px-2 flex flex-row items-center">
                        <div className="flex relative gap-x-2 flex-1 items-center">
                            {icon}
                            <h1 className="text-gray-800 text-sm">{title}</h1>
                        </div>
                        <button
                            onClick={onAddItem}
                            className="inline-block text-xl px-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200"
                        >
                            +
                        </button>
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

            <div className="px-1">
                {children}
            </div>
        </div>
    );
};

export default Container;