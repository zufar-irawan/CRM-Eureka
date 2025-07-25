import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { GripVertical } from 'lucide-react';

type ItemsType = {
    id: UniqueIdentifier;
    title: string;
};

const Items = ({ id, title }: ItemsType) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id,
        data: {
            type: 'item',
        },
    });
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
            }}
            className={clsx(
                'px-2 py-4 bg-white rounded-xl w-full border border-gray-200 cursor-pointer',
                isDragging && 'opacity-50',
            )}
        >
            <div className="flex pl-1.5 text-sm items-center justify-between">
                {title}
                <button
                    className="p-2 hover:bg-gray-100 rounded-xl group text-gray-500"
                    {...listeners}
                >
                    <GripVertical size={16} className='group-hover:text-gray-800' />
                </button>
            </div>
        </div>
    );
};

export default Items;