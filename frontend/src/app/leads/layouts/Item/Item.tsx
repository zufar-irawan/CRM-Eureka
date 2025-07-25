import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { GripVertical, AtSign, FileText, CheckCircle, RotateCcw, MessageCircle, Plus } from 'lucide-react';

type ItemsType = {
    id: UniqueIdentifier
    fullname: string
    organization: string
    email: string
    mobileno: string
};

const Items = ({ id, fullname, organization, email, mobileno }: ItemsType) => {
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
                'px-2 py-1 bg-white rounded-xl w-full border border-gray-200 cursor-pointer',
                isDragging && 'opacity-50',
            )}
        >
            <div className="flex pl-1.5 text-[0.8rem] items-center justify-between">
                {fullname}
                <button
                    className="p-2 hover:bg-gray-100 rounded-xl group text-gray-500"
                    {...listeners}
                >
                    <GripVertical size={16} className='group-hover:text-gray-800' />
                </button>
            </div>

            <div className='w-full py-1'>
                <div className="bg-gray-300 text-[0.1px]">-</div>
            </div>

            <div className="flex flex-col pl-1.5 text-[0.8rem] gap-y-4 py-5">
                <span className="text-xs">
                    {organization}
                </span>

                <span className="text-xs">
                    {email}
                </span>

                <span className="text-xs">
                    {mobileno}
                </span>
            </div>

            <div className='w-full py-1'>
                <div className="bg-gray-300 text-[0.1px]">-</div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-sm px-1.5 py-3">
                <AtSign className="w-3.5 h-3.5" />
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <FileText className="w-3.5 h-3.5" />
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <CheckCircle className="w-3.5 h-3.5" />
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <MessageCircle className="w-3.5 h-3.5" />
                <div className="flex-1"></div>
                <Plus className="w-3 h-3" />
            </div>
        </div>
    )
}

export default Items;