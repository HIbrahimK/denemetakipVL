"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ParentResultsPage() {
    const [loading, setLoading] = useState(true);
    const [parentData, setParentData] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchParentData = async () => {
            const token = localStorage.getItem("token");
            
            try {
                // Get parent's student data
                const res = await fetch("http://localhost:3001/parents/me/students", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setParentData(data);

                    // If parent has students, redirect to first student's results
                    if (data.students && data.students.length > 0) {
                        router.push(`/dashboard/student/results?studentId=${data.students[0].id}`);
                    }
                } else {
                    console.error("Failed to fetch parent data");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchParentData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Yükleniyor...</p>
            </div>
        );
    }

    if (!parentData || !parentData.students || parentData.students.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-slate-500 text-lg">Kayıtlı öğrenci bulunamadı.</p>
                    <p className="text-slate-400 text-sm mt-2">Lütfen okul yönetimine başvurun.</p>
                </div>
            </div>
        );
    }

    return null; // Will redirect automatically
}
