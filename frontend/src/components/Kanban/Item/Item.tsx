import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { AtSign, FileText, CheckCircle, MessageCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ItemsType = {
    id: UniqueIdentifier;
    fullname: string;
    organization: string;
    email: string;
    mobileno: string;
    pathname: string;
    itemId: number;
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
        id,
        data: { type: 'item' },
        disabled: false,
    });

    const handleMouseDown = (e: React.MouseEvent) => {
        clickStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const getDetailRoute = () => {
        if (pathname === "Deals") return `/deals/detail/${itemId}`;
        if (pathname === "Leads") return `/leads/detail/${itemId}`;
        return `/tasks/detail/${itemId}`;
    };

    const handleClick = (e: React.MouseEvent) => {
        if (isDragging) return;
        if (e.detail === 0) return;
        router.push(getDetailRoute());
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
            }}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            className="group px-2 py-1 bg-white rounded-xl w-full border border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        >
            {/* Grip horizontal: bagian normal dari flow */}
            <div
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="
                    w-full flex justify-center items-center
                    overflow-hidden transition-all duration-200
                    h-0 group-hover:h-4 cursor-grab
                "
            >
                <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Konten utama card */}
            <div className="flex pl-1.5 py-2 text-md items-center justify-between transition-all duration-200">
                <span className="font-medium text-gray-900">{fullname}</span>
            </div>

            <div className="w-full py-1">
                <div className="bg-gray-300 text-[0.1px]">-</div>
            </div>

            <div className="flex flex-col pl-1.5 text-[0.8rem] gap-y-4 py-5">
                <span className="text-xs text-gray-600">{organization}</span>
                <span className="text-xs text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                    {email}
                </span>
                <span className="text-xs text-gray-600">{mobileno}</span>
            </div>

            {/* <div className="w-full py-1">
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
            </div> */}
        </div>
    );
};

export default Items;
