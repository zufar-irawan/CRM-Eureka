import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { AtSign, FileText, CheckCircle, MessageCircle, Plus, DollarSign, Building2, Loader2 } from 'lucide-react';

type ItemsType = {
    id: UniqueIdentifier
    fullname: string
    organization: string
    email: string
    mobileno: string
    value?: number // For deals
    itemType?: 'lead' | 'deal' // Specify item type
    isUpdating?: boolean
};

const Items = ({ 
    id, 
    fullname, 
    organization, 
    email, 
    mobileno, 
    value,
    itemType = 'lead',
    isUpdating = false
}: ItemsType) => {
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
        disabled: isUpdating
    });

    // Format value for display (for deals)
    const formatValue = (val?: number) => {
        if (!val || val === 0) return "$0.00";
        return `$${val.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
            }}
            className={clsx(
                'px-2 py-1 bg-white rounded-xl w-full border border-gray-200 cursor-pointer relative',
                isDragging && 'opacity-50 shadow-lg scale-105',
                isUpdating && 'opacity-60'
            )}
            {...listeners}
        >
            {/* Header with name/title and value (for deals) */}
            <div className="flex pl-1.5 py-2 text-md items-center justify-between">
                <span className="font-medium text-gray-900 truncate flex-1">
                    {fullname}
                </span>
                {/* Show value for deals */}
                {itemType === 'deal' && value !== undefined && (
                    <div className="flex items-center text-green-600 ml-2 flex-shrink-0">
                        <DollarSign className="w-3 h-3" />
                        <span className="text-xs font-medium">
                            {formatValue(value)}
                        </span>
                    </div>
                )}
            </div>

            <div className='w-full py-1'>
                <div className="bg-gray-300 text-[0.1px]">-</div>
            </div>

            <div className="flex flex-col pl-1.5 text-[0.8rem] gap-y-4 py-5">
                {/* Organization with icon for deals */}
                <div className="flex items-center text-xs">
                    {itemType === 'deal' && <Building2 className="w-3 h-3 mr-1 text-blue-600" />}
                    <span className="truncate">
                        {organization}
                    </span>
                </div>

                <span className="text-xs text-blue-600 hover:underline cursor-pointer truncate">
                    {email}
                </span>

                <span className="text-xs truncate">
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

            {/* Loading overlay when updating */}
            {isUpdating && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center">
                    <div className="flex items-center text-xs text-blue-600">
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        Updating...
                    </div>
                </div>
            )}
        </div>
    )
}

export default Items;