import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { AtSign, FileText, CheckCircle, MessageCircle, Plus, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ItemsType = {
    id: UniqueIdentifier
    fullname: string
    organization: string
    email: string
    mobileno: string
    leadId: number
};

const Items = ({ id, fullname, organization, email, mobileno, leadId }: ItemsType) => {
    const router = useRouter();

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

    // Handle click to navigate - tidak conflict dengan drag
    const handleNavigate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/leads/detail/${leadId}`);
    };

    // Handle keyboard navigation
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(`/leads/detail/${leadId}`);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
            }}
            className={clsx(
                'bg-white rounded-xl w-full border border-gray-200 transition-all duration-150 relative',
                isDragging ? 'shadow-lg scale-105 z-10' : 'hover:shadow-md hover:border-gray-300'
            )}
        >
            {/* Drag Handle Area - Hanya bagian ini yang bisa di-drag */}
            <div 
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </div>

            {/* Clickable Content Area - Area ini untuk navigate */}
            <div 
                className="px-2 py-1 cursor-pointer group"
                onClick={handleNavigate}
                onKeyPress={handleKeyPress}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${fullname}`}
            >
                <div className="flex pl-1.5 py-2 text-md items-center justify-between">
                    <span className="font-medium text-gray-900 truncate">
                        {fullname}
                    </span>
                </div>

                <div className='w-full py-1'>
                    <div className="bg-gray-300 text-[0.1px]">-</div>
                </div>

                <div className="flex flex-col pl-1.5 text-[0.8rem] gap-y-4 py-5">
                    <span className="text-xs text-gray-600 truncate">
                        {organization}
                    </span>

                    <span className="text-xs text-gray-600 hover:text-blue-600 transition-colors truncate">
                        {email}
                    </span>

                    <span className="text-xs text-gray-600">
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

                {/* Visual feedback untuk click area */}
                <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-150 rounded-xl pointer-events-none" />
            </div>
        </div>
    )
}

export default Items;