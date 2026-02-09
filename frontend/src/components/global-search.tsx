"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, User, BookOpen, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchResult {
    id?: string;
    type: 'student' | 'exam' | 'class';
    label: string;
    subtitle: string;
    icon: string;
    className?: string;
}

export function GlobalSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                performSearch();
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async () => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const schoolId = user?.schoolId || "";
        const token = localStorage.getItem('token');

        if (!schoolId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3001/search/autocomplete?q=${encodeURIComponent(searchQuery)}&schoolId=${schoolId}`,
                {
                    headers: {
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setResults(data);
                setIsOpen(data.length > 0);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (result: SearchResult) => {
        setIsOpen(false);
        setSearchQuery("");

        if (result.type === 'student') {
            router.push(`/dashboard/search?type=student&id=${result.id}`);
        } else if (result.type === 'exam') {
            router.push(`/dashboard/exams/${result.id}/results`);
        } else if (result.type === 'class') {
            router.push(`/dashboard/search?type=class&name=${encodeURIComponent(result.className || '')}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
            router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
            setIsOpen(false);
        }
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'user': return <User className="h-4 w-4" />;
            case 'book': return <BookOpen className="h-4 w-4" />;
            case 'users': return <Users className="h-4 w-4" />;
            default: return <Search className="h-4 w-4" />;
        }
    };

    return (
        <div className="relative w-96" ref={wrapperRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
            {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin z-10" />
            )}
            <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Sınav, öğrenci veya sınıf ara..."
                className="pl-10 pr-10 bg-white dark:bg-slate-800 border-transparent shadow-sm hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded-full transition-all text-slate-800 dark:text-slate-100"
            />

            {/* Autocomplete Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                        {results.map((result, index) => (
                            <button
                                key={`${result.type}-${result.id || result.className}-${index}`}
                                onClick={() => handleResultClick(result)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                    {getIcon(result.icon)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                        {result.label}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {result.subtitle}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Tüm sonuçları görmek için Enter'a basın
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
