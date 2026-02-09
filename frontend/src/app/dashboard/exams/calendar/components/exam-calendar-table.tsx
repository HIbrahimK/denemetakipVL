'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Edit,
    Trash2,
    Copy,
    Archive,
    Eye,
    EyeOff,
    FileText,
    Upload,
    MoreHorizontal,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { EditExamModal } from './edit-exam-modal';

interface ExamCalendarTableProps {
    year: number;
    type?: string;
    gradeLevel?: number;
    includeArchived: boolean;
    refreshTrigger: number;
    onRefresh: () => void;
}

interface Exam {
    id: string;
    title: string;
    type: string;
    publisher?: string;
    gradeLevel: number;
    date: string;
    scheduledDateTime?: string;
    applicationDateTime?: string;
    broughtBy?: string;
    quantity?: number;
    fee?: number;
    isPaid: boolean;
    color?: string;
    isArchived: boolean;
    isPublished: boolean;
    isPublisherVisible: boolean;
    isAnswerKeyPublic: boolean;
    answerKeyUrl?: string;
    schoolParticipantCount?: number;
    _count?: { attempts: number };
}

export function ExamCalendarTable({
    year,
    type,
    gradeLevel,
    includeArchived,
    refreshTrigger,
    onRefresh,
}: ExamCalendarTableProps) {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
    const [editExam, setEditExam] = useState<Exam | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // desc = son deneme üstte
    const { toast } = useToast();
    const router = useRouter();

    const getSchoolId = () => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            const user = JSON.parse(userStr);
            return user.schoolId;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetchExams();
    }, [year, type, gradeLevel, includeArchived, refreshTrigger, sortOrder]);

    const fetchExams = async () => {
        const schoolId = getSchoolId();
        if (!schoolId) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                schoolId,
                year: year.toString(),
                includeArchived: includeArchived.toString(),
            });

            if (type) params.append('type', type);
            if (gradeLevel) params.append('gradeLevel', gradeLevel.toString());

            const response = await fetch(`${API_BASE_URL}/exams/calendar/view?${params}`, {
                headers: {
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Varsayılan: Son deneme üstte (desc)
                const sorted = [...data].sort((a, b) => {
                    const dateA = new Date(a.scheduledDateTime || a.date).getTime();
                    const dateB = new Date(b.scheduledDateTime || b.date).getTime();
                    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                });
                setExams(sorted);
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
            toast({
                title: 'Hata',
                description: 'Sınavlar yüklenirken bir hata oluştu',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteExamId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/exams/${deleteExamId}`, {
                method: 'DELETE',
                headers: {
                },
            });

            if (response.ok) {
                toast({
                    title: 'Başarılı',
                    description: 'Sınav silindi',
                });
                onRefresh();
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Sınav silinirken bir hata oluştu',
                variant: 'destructive',
            });
        } finally {
            setDeleteExamId(null);
        }
    };

    const handleToggleArchive = async (examId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/exams/${examId}/toggle-archive`, {
                method: 'PATCH',
                headers: {
                },
            });

            if (response.ok) {
                toast({
                    title: 'Başarılı',
                    description: 'Arşiv durumu göncellendi',
                });
                onRefresh();
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'İşlem başarısız',
                variant: 'destructive',
            });
        }
    };

    const handleTogglePublisher = async (examId: string) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/exams/${examId}/toggle-publisher-visibility`,
                {
                    method: 'PATCH',
                    headers: {
                    },
                }
            );

            if (response.ok) {
                toast({
                    title: 'Başarılı',
                    description: 'Yayın görünürlüğü göncellendi',
                });
                onRefresh();
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'İşlem başarısız',
                variant: 'destructive',
            });
        }
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            TYT: 'bg-blue-500',
            AYT: 'bg-purple-500',
            LGS: 'bg-green-500',
            OZEL: 'bg-orange-500',
        };
        return colors[type] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">Yükleniyor...</p>
            </Card>
        );
    }

    if (exams.length === 0) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">Henüz deneme eklenmemiş.</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Yeni deneme eklemek için yukarıdaki butonu kullanın.
                </p>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Toplam {exams.length} deneme
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
                            setSortOrder(newOrder);
                            const sorted = [...exams].sort((a, b) => {
                                const dateA = new Date(a.scheduledDateTime || a.date).getTime();
                                const dateB = new Date(b.scheduledDateTime || b.date).getTime();
                                return newOrder === 'desc' ? dateB - dateA : dateA - dateB;
                            });
                            setExams(sorted);
                        }}
                    >
                        {sortOrder === 'desc' ? 'v Son deneme üstte' : '^ İlk deneme üstte'}
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Deneme Adı</TableHead>
                                <TableHead>Yayın</TableHead>
                                <TableHead>Tür</TableHead>
                                <TableHead>Sınıf</TableHead>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Uygulama</TableHead>
                                <TableHead>Getiren</TableHead>
                                <TableHead>Adet</TableHead>
                                <TableHead>Ücret</TableHead>
                                <TableHead>Ödeme</TableHead>
                                <TableHead>Katılım</TableHead>
                                <TableHead>Cevap</TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exams.map((exam) => (
                                <TableRow
                                    key={exam.id}
                                    className={exam.isArchived ? 'opacity-60' : ''}
                                    style={{
                                        borderLeft: exam.color
                                            ? `4px solid ${exam.color}`
                                            : undefined,
                                    }}
                                >
                                    <TableCell className="font-medium">
                                        <button
                                            onClick={() =>
                                                router.push(`/dashboard/exams/${exam.id}/results`)
                                            }
                                            className="text-blue-600 hover:underline text-left"
                                        >
                                            {exam.title}
                                        </button>
                                        {exam.isArchived && (
                                            <Badge variant="secondary" className="ml-2">
                                                <Archive className="w-3 h-3 mr-1" />
                                                Arşiv
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {exam.publisher || '-'}
                                        {exam.isPublisherVisible && (
                                            <Eye className="w-3 h-3 inline ml-1 text-green-500" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getTypeColor(exam.type)}>
                                            {exam.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{exam.gradeLevel}. Sınıf</TableCell>
                                    <TableCell>
                                        {exam.scheduledDateTime
                                            ? format(
                                                  new Date(exam.scheduledDateTime),
                                                  'dd MMM yyyy',
                                                  { locale: tr }
                                              )
                                            : format(new Date(exam.date), 'dd MMM yyyy', {
                                                  locale: tr,
                                              })}
                                    </TableCell>
                                    <TableCell>
                                        {exam.applicationDateTime
                                            ? format(
                                                  new Date(exam.applicationDateTime),
                                                  'dd MMM yyyy',
                                                  { locale: tr }
                                              )
                                            : '-'}
                                    </TableCell>
                                    <TableCell>{exam.broughtBy || '-'}</TableCell>
                                    <TableCell>{exam.quantity || '-'}</TableCell>
                                    <TableCell>
                                        {exam.fee ? `${exam.fee} ?` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {exam.fee ? (
                                            exam.isPaid ? (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-green-50 text-green-700 border-green-200"
                                                >
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Ödendi
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-red-50 text-red-700 border-red-200"
                                                >
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Ödenmedi
                                                </Badge>
                                            )
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>Okul: {exam.schoolParticipantCount || 0}</div>
                                            {exam._count && (
                                                <div className="text-muted-foreground">
                                                    Giren: {exam._count.attempts}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {exam.answerKeyUrl ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        window.open(
                                                            `${API_BASE_URL}/exams/${exam.id}/answer-key`,
                                                            '_blank'
                                                        )
                                                    }
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </Button>
                                                {exam.isAnswerKeyPublic && (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-green-50 text-green-700 border-green-200 text-xs"
                                                    >
                                                        Açık
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        router.push(`/dashboard/exams/${exam.id}/results`)
                                                    }
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Sonuçları Gör
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setEditExam(exam)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Düzenle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Baçka Sınıflara Kopyala
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Cevap Anahtarı Yükle
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleTogglePublisher(exam.id)}
                                                >
                                                    {exam.isPublisherVisible ? (
                                                        <>
                                                            <EyeOff className="w-4 h-4 mr-2" />
                                                            Yayını Gizle
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Yayını Göster
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleArchive(exam.id)}
                                                >
                                                    <Archive className="w-4 h-4 mr-2" />
                                                    {exam.isArchived ? 'Arşivden Çıkar' : 'Arşivle'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteExamId(exam.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Sil
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <AlertDialog open={!!deleteExamId} onOpenChange={() => setDeleteExamId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Denemeyi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu denemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz
                            ve tüm sonuçlar silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditExamModal
                exam={editExam}
                open={!!editExam}
                onClose={() => setEditExam(null)}
                onSuccess={onRefresh}
            />
        </>
    );
}
