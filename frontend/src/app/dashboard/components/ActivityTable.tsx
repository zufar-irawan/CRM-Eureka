"use client";

import { Mail, CheckCircle, Phone, CalendarCheck } from "lucide-react";

const activities = [
    {
        activity: "Email sent to",
        lead: "Siti Kartika",
        date: "Today"
    },
    {
        activity: "Task completed",
        lead: "Budi Santoso",
        date: "Today"
    },
    {
        activity: "Call with",
        lead: "Andi Rahman",
        date: "Yesterday"
    },
    {
        activity: "Meeting scheduled",
        lead: "PT Cipta Sejahtera",
        date: "Apr'23"
    }
];

export default function ActivityTable() {
    return (
        <div className="p-4 w-full max-w-5xl mx-auto mt-6">
            {/* Header Row */}
            <div className="grid grid-cols-3 font-semibold text-gray-500 text-sm border-b pb-4">
                <div className="">Activity</div>
                <div className="">Lead</div>
                <div className="text-right">Date</div>
            </div>

            {/* Rows */}
            {activities.map((item, index) => (
                <div
                    key={index}
                    className="grid grid-cols-3 items-center border-gray-800 text-sm pb-4 pt-4 first:pt-0 border-b last:border-b-0"
                >
                    <div className="flex items-center gap-2 text-gray-800">
                        {item.activity}
                    </div>
                    <div className="text-gray-800">{item.lead}</div>
                    <div className="text-right text-gray-800">{item.date}</div>
                </div>
            ))}
        </div>
    );
}
