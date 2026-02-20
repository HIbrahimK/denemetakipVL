"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ParentResultsPage() {
    const [loading, setLoading] = useState(true);
    const [parentData, setParentData] = useState<any>(null);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchParentData = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const res = await fetch(`${API_BASE_URL}/parents/me/students`, {
                    credentials: "include",
                    signal: controller.signal,
                });

                if (res.ok) {
                    const data = await res.json();
                    setParentData(data);

                    if (data.students && data.students.length > 0) {
                        router.push(`/dashboard/student/results?studentId=${data.students[0].id}`);
                    }
                } else if (res.status === 401 || res.status === 403) {
                    router.push("/login/parent");
                } else {
                    setError("Veli bilgileri alınamadı.");
                }
            } catch (err: any) {
                if (err?.name === "AbortError") {
                    setError("İstek zaman aşımına uğradı. Lütfen tekrar deneyin.");
                } else {
                    setError("Veli bilgileri alınamadı.");
                }
            } finally {
                clearTimeout(timeoutId);
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
                    {error ? (
                        <p className="text-slate-500 text-lg">{error}</p>
                    ) : (
                        <>
                            <p className="text-slate-500 text-lg">Kayıtlı öğrenci bulunamadı.</p>
                            <p className="text-slate-400 text-sm mt-2">Lütfen okul yönetimine başvurun.</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
