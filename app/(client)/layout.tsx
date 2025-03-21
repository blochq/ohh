'use client';

import { getAuthToken } from "@/lib/helper-function";
import { notFound } from "next/navigation";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = getAuthToken();
    if (!token) {
        return notFound();
    }
    return (
        <div>
        
                {children}
       
        </div>
    );
}

