'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, ChevronLeft, ChevronRight, BookOpen, Clock, HelpCircle, FileText, Save, Globe, Lock, Target, Copy as CopyIcon, MoreVertical, X, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// Types (Mirrored from New Page)
interface Subject {
    id: string;
    name: string;
    examType: string;
    gradeLevels: number[];
}

interface Topic {
    id: string;
    name: string;
    subjectId: string;
    parentTopicId?: string | null;
}

interface CellData {
    subjectName?: string;
    topicName?: string;
    targetQuestionCount?: number;
    targetDuration?: number;
    targetResource?: string;
    customContent?: string;
}

interface PlanRow {
    id: string;
    cells: (CellData | null)[];
}

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const EXAM_TYPES = [
    { value: 'TYT', label: 'TYT', grades: [9, 10, 11, 12] },
    { value: 'AYT', label: 'AYT', grades: [10, 11, 12] },
    { value: 'LGS', label: 'LGS', grades: [5, 6, 7, 8] },
];

export default function EditStudyPlanPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const planId = params.id as string;

    // State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [examType, setExamType] = useState<string>('');
    const [gradeLevels, setGradeLevels] = useState<number[]>([]);
    const [isTemplate, setIsTemplate] = useState(true);
    const [isPublic, setIsPublic] = useState(false);

    const [rows, setRows] = useState<PlanRow[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; dayIndex: number } | null>(null);
    const [cellModalOpen, setCellModalOpen] = useState(false);
    const [editingCellData, setEditingCellData] = useState<CellData>({});
    const [selectedSubjectForTopics, setSelectedSubjectForTopics] = useState<string>('');
    const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        Promise.all([fetchSubjects(), fetchTopics(), fetchPlan()]).finally(() => setLoading(false));
    }, [planId]);

    useEffect(() => {
        if (selectedSubjectForTopics) {
            if (selectedSubjectForTopics === 'Aktiviteler') {
                const commonActivities = subjects
                    .filter(s => s.examType === 'COMMON')
                    .map(s => ({ id: s.id, name: s.name, subjectId: 'activities' }));
                setFilteredTopics(commonActivities);
            } else {
                const subject = subjects.find(s => s.name === selectedSubjectForTopics);
                if (subject) {
                    setFilteredTopics(topics.filter(t => t.subjectId === subject.id));
                } else {
                    setFilteredTopics([]);
                }
            }
        } else {
            setFilteredTopics([]);
        }
    }, [selectedSubjectForTopics, subjects, topics]);

    const fetchPlan = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/study/plans/${planId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setName(data.name);
                setDescription(data.description || '');
                setExamType(data.examType);
                setGradeLevels(data.gradeLevels);
                setIsTemplate(data.isTemplate);
                setIsPublic(data.isPublic || false);
                setRows(data.planData.rows.map((row: any) => ({
                    id: row.id || Date.now().toString(),
                    cells: row.cells.map((cell: any) => cell || null)
                })));
            } else {
                throw new Error('Plan yüklenemedi');
            }
        } catch (error) {
            toast({ title: 'Hata', description: 'Plan yüklenemedi', variant: 'destructive' });
            router.push('/dashboard/study-plans');
        }
    };

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/subjects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setSubjects(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchTopics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/subjects/topics/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setTopics(await res.json());
        } catch (error) { console.error(error); }
    };

    const getAvailableGrades = () => {
        const exam = EXAM_TYPES.find(e => e.value === examType);
        return exam?.grades || [];
    };

    const toggleGrade = (grade: number) => {
        setGradeLevels(prev =>
            prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
        );
    };

    const addRow = () => {
        setRows(prev => [...prev, { id: Date.now().toString(), cells: Array(7).fill(null) }]);
    };

    const removeRow = (rowIndex: number) => {
        setRows(prev => prev.filter((_, i) => i !== rowIndex));
    };

    const openCellModal = (rowIndex: number, dayIndex: number) => {
        const cellData = rows[rowIndex]?.cells[dayIndex] || {};
        setEditingCellData({ ...cellData });
        setSelectedSubjectForTopics(cellData.subjectName || '');
        setSelectedCell({ rowIndex, dayIndex });
        setCellModalOpen(true);
    };

    const saveCellData = () => {
        if (!selectedCell) return;
        const { rowIndex, dayIndex } = selectedCell;
        setRows(prev => {
            const newRows = [...prev];
            const hasData = editingCellData.subjectName ||
                editingCellData.topicName ||
                editingCellData.targetQuestionCount ||
                editingCellData.targetDuration ||
                editingCellData.targetResource ||
                editingCellData.customContent;
            newRows[rowIndex].cells[dayIndex] = hasData ? { ...editingCellData } : null;
            return newRows;
        });
        setCellModalOpen(false);
        setSelectedCell(null);
    };

    const clearCellData = () => {
        setEditingCellData({});
        setSelectedSubjectForTopics('');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const [, activeRow, activeDay] = active.id.toString().split('-').map(Number);
        const [, overRow, overDay] = over.id.toString().split('-').map(Number);
        if (isNaN(activeRow) || isNaN(activeDay) || isNaN(overRow) || isNaN(overDay)) return;

        const activeCellData = rows[activeRow]?.cells[activeDay];
        const overCellData = rows[overRow]?.cells[overDay];

        setRows(prev => {
            const newRows = [...prev];
            newRows[activeRow].cells[activeDay] = overCellData;
            newRows[overRow].cells[overDay] = activeCellData;
            return newRows;
        });
    };

    const buildPlanData = () => ({
        rows: rows.map(row => ({
            id: row.id,
            cells: row.cells.map(cell => cell || null)
        }))
    });

    const savePlan = async (asCopy = false) => {
        setSaving(true);
        const token = localStorage.getItem('token');

        try {
            const planPayload = {
                name: asCopy ? `${name} (Kopya)` : name,
                description,
                examType,
                gradeLevels,
                planData: buildPlanData(),
                status: 'DRAFT',
                isTemplate,
                isPublic: isTemplate ? isPublic : false,
            };

            const url = asCopy
                ? 'http://localhost:3001/study/plans'
                : `http://localhost:3001/study/plans/${planId}`;

            const method = asCopy ? 'POST' : 'PATCH';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(planPayload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Plan kaydedilirken hata oluştu');
            }

            toast({
                title: 'Başarılı',
                description: asCopy ? 'Şablon kopyalandı' : 'Plan güncellendi',
            });

            router.push('/dashboard/study-plans');
        } catch (error: any) {
            toast({
                title: 'Hata',
                description: error.message || 'Bir hata oluştu',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const DraggableCell = ({ cell, rowIndex, dayIndex }: { cell: CellData | null; rowIndex: number; dayIndex: number }) => {
        const cellId = `cell-${rowIndex}-${dayIndex}`;
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cellId });
        const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

        return (
            <div ref={setNodeRef} style={style} className="relative group">
                <button
                    type="button"
                    onClick={() => openCellModal(rowIndex, dayIndex)}
                    {...attributes} {...listeners}
                    className={`w-full min-h-[60px] p-2 rounded-md text-left text-sm transition-colors cursor-move ${cell ? 'bg-primary/10 hover:bg-primary/20 border border-primary/30' : 'bg-muted/50 hover:bg-muted border border-dashed border-muted-foreground/30'
                        }`}
                >
                    {cell ? (
                        <div className="space-y-1">
                            <div className="font-medium truncate">{cell.subjectName}</div>
                            {cell.topicName && <div className="text-xs text-muted-foreground truncate">{cell.topicName}</div>}
                            <div className="flex gap-2 text-xs">
                                {cell.targetQuestionCount && <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" />{cell.targetQuestionCount}</span>}
                                {cell.targetDuration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{cell.targetDuration}dk</span>}
                            </div>
                            {cell.customContent && (
                                <div className="text-xs text-blue-600 truncate mt-1 border-t border-blue-100 pt-1 font-medium">{cell.customContent}</div>
                            )}
                        </div>
                    ) : <div className="h-full flex items-center justify-center text-muted-foreground"><Plus className="h-4 w-4" /></div>}
                </button>
            </div>
        );
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="container mx-auto py-6 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Planı Düzenle: {name}</h1>
                    <p className="text-muted-foreground">Mevcut çalışma planını güncelleyin</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => savePlan(true)}>
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Kopya Oluştur
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Plan Adı</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Açıklama</Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                    </div>
                    {isTemplate && (
                        <div className="flex items-center space-x-2 border p-3 rounded">
                            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                            <Label htmlFor="public">Diğer öğretmenlerle paylaş</Label>
                        </div>
                    )}
                    <div className="flex items-center space-x-2 border p-3 rounded">
                        <Switch id="template" checked={isTemplate} onCheckedChange={setIsTemplate} />
                        <Label htmlFor="template">Şablon olarak işaretle</Label>
                    </div>
                </div>

                <div className="md:col-span-2 border rounded-lg p-4 bg-slate-50 overflow-auto max-h-[600px]">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={rows.flatMap((r, ri) => r.cells.map((_, di) => `cell-${ri}-${di}`))} strategy={rectSortingStrategy}>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="p-2 w-10">#</th>
                                        {DAYS.map(d => <th key={d} className="p-2 min-w-[120px] text-left text-xs font-medium uppercase text-muted-foreground">{d}</th>)}
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, rowIndex) => (
                                        <tr key={row.id} className="border-t bg-white">
                                            <td className="p-2 text-center text-muted-foreground">{rowIndex + 1}</td>
                                            {row.cells.map((cell, dayIndex) => (
                                                <td key={dayIndex} className="p-1">
                                                    <DraggableCell cell={cell} rowIndex={rowIndex} dayIndex={dayIndex} />
                                                </td>
                                            ))}
                                            <td className="p-1"><Button variant="ghost" size="icon" onClick={() => removeRow(rowIndex)} disabled={rows.length === 1}><Trash2 className="h-4 w-4 text-red-500" /></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Button variant="outline" className="w-full mt-4" onClick={addRow}><Plus className="mr-2 h-4 w-4" />Satır Ekle</Button>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> İptal
                </Button>
                <Button onClick={() => savePlan(false)} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
            </div>

            <Dialog open={cellModalOpen} onOpenChange={setCellModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Hücre Düzenle</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Ders</Label>
                            <Select value={selectedSubjectForTopics} onValueChange={(v) => { setSelectedSubjectForTopics(v); setEditingCellData(p => ({ ...p, subjectName: v, topicName: '' })); }}>
                                <SelectTrigger><SelectValue placeholder="Ders seçin" /></SelectTrigger>
                                <SelectContent>
                                    {subjects.filter(s => s.examType === examType).map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                    {subjects.some(s => s.examType === 'COMMON') && <SelectItem value="Aktiviteler">Aktiviteler</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Konu</Label>
                            <Select value={editingCellData.topicName || ''} onValueChange={v => setEditingCellData(p => ({ ...p, topicName: v }))} disabled={!selectedSubjectForTopics}>
                                <SelectTrigger><SelectValue placeholder="Konu seçin" /></SelectTrigger>
                                <SelectContent>
                                    {(() => {
                                        const rootTopics = filteredTopics.filter(t => !t.parentTopicId);
                                        const childTopics = filteredTopics.filter(t => t.parentTopicId);
                                        if (rootTopics.length === 0 && childTopics.length > 0) return childTopics.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>);
                                        if (rootTopics.length === 0 && childTopics.length === 0) return <div className="p-2 text-sm">Konu yok</div>;
                                        return (
                                            <>
                                                {rootTopics.map(root => {
                                                    const children = childTopics.filter(c => c.parentTopicId === root.id);
                                                    return (
                                                        <SelectGroup key={root.id}>
                                                            <SelectLabel className="font-semibold text-primary/80">{root.name}</SelectLabel>
                                                            <SelectItem value={root.name}>{root.name} (Genel)</SelectItem>
                                                            {children.map(child => <SelectItem key={child.id} value={child.name} className="pl-6">• {child.name}</SelectItem>)}
                                                        </SelectGroup>
                                                    )
                                                })}
                                                {childTopics.filter(c => !rootTopics.find(r => r.id === c.parentTopicId)).map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}
                                            </>
                                        )
                                    })()}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Soru Sayısı</Label><Input type="number" value={editingCellData.targetQuestionCount || ''} onChange={e => setEditingCellData(p => ({ ...p, targetQuestionCount: +e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Süre (dk)</Label><Input type="number" value={editingCellData.targetDuration || ''} onChange={e => setEditingCellData(p => ({ ...p, targetDuration: +e.target.value }))} /></div>
                        </div>
                        <div className="space-y-2"><Label>Kaynak</Label><Input value={editingCellData.targetResource || ''} onChange={e => setEditingCellData(p => ({ ...p, targetResource: e.target.value }))} /></div>
                        <div className="space-y-2"><Label>Özel İçerik</Label><Textarea value={editingCellData.customContent || ''} onChange={e => setEditingCellData(p => ({ ...p, customContent: e.target.value }))} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={clearCellData}>Temizle</Button><Button onClick={saveCellData}>Kaydet</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
