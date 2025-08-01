import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { GripVertical, AtSign, FileText, CheckCircle, RotateCcw, MessageCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ItemsType = {
    id: UniqueIdentifier
    fullname: string
    organization: string
    email: string
    mobileno: string
    pathname: string
    itemId: number  // Add leadId prop
};

const Items = ({ id, fullname, organization, email, mobileno, pathname, itemId }: ItemsType) => {
    const router = useRouter();
    const clickStartPos = React.useRef<{ x: number; y: number } | null>(null);

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

    // Handle mouse down to record initial position
    const handleMouseDown = (e: React.MouseEvent) => {
        clickStartPos.current = { x: e.clientX, y: e.clientY };
    };

    let routes = ""

    if (pathname === "Deals") {
        routes = `/deals/detail/${itemId}`
    } else if (pathname === "Leads") {
        routes = `/leads/detail/${itemId}`
    }

    // Handle click to navigate to detail page
    const handleClick = (e: React.MouseEvent) => {
        // Check if mouse moved significantly (indicating drag)
        if (clickStartPos.current) {
            const deltaX = Math.abs(e.clientX - clickStartPos.current.x);
            const deltaY = Math.abs(e.clientY - clickStartPos.current.y);

            // If moved more than 5px, consider it a drag, not a click
            if (deltaX > 5 || deltaY > 5) {
                return;
            }
        }

        // Prevent navigation if currently dragging
        if (isDragging) {
            return;
        }

        // Prevent navigation if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) {
            return;
        }

        // Navigate to lead detail page
        router.push(routes)
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
            }}
            className='px-2 py-1 bg-white rounded-xl w-full border border-gray-200 cursor-pointer'
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            {...listeners}
        >
            <div className="flex pl-1.5 py-2 text-md items-center justify-between">
                <span className="font-medium text-gray-900">
                    {fullname}
                </span>
            </div>

            <div className='w-full py-1'>
                <div className="bg-gray-300 text-[0.1px]">-</div>
            </div>

            <div className="flex flex-col pl-1.5 text-[0.8rem] gap-y-4 py-5">
                <span className="text-xs text-gray-600">
                    {organization}
                </span>

                <span className="text-xs text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
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
        </div>
    )
}

export default Items;