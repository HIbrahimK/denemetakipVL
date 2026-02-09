'use client';

import { useState, useEffect, Suspense } from 'react';
import { API_BASE_URL } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, ChevronLeft, ChevronRight, BookOpen, Clock, HelpCircle, FileText, Save, Globe, Lock, Target, Copy as CopyIcon, MoreVertical, X, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// Types
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
  cells: (CellData | null)[]; // 7 days
}

interface StudyPlanTemplate {
  id: string;
  name: string;
  description?: string;
  examType: string;
  gradeLevels: number[];
  planData: any;
}

type Step = 1 | 2 | 3;

const DAYS = ['Pazartesi', 'Salý', 'Çarþamba', 'Perþembe', 'Cuma', 'Cumartesi', 'Pazar'];
const EXAM_TYPES = [
  { value: 'TYT', label: 'TYT', grades: [9, 10, 11, 12] },
  { value: 'AYT', label: 'AYT', grades: [10, 11, 12] },
  { value: 'LGS', label: 'LGS', grades: [5, 6, 7, 8] },
];

function NewStudyPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Edit mode
  const editPlanId = searchParams.get('edit');
  const isEditMode = !!editPlanId;

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Plan Info (no target selection)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [examType, setExamType] = useState<string>('');
  const [isTemplate, setIsTemplate] = useState(true);
  const [isPublic, setIsPublic] = useState(false);

  // Step 2: Template Selection
  const [templates, setTemplates] = useState<StudyPlanTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StudyPlanTemplate | null>(null);

  // Step 3: Table Editing
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; dayIndex: number } | null>(null);
  const [cellModalOpen, setCellModalOpen] = useState(false);
  const [editingCellData, setEditingCellData] = useState<CellData>({});
  const [selectedSubjectForTopics, setSelectedSubjectForTopics] = useState<string>('');
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [contextMenuCell, setContextMenuCell] = useState<{ rowIndex: number; dayIndex: number } | null>(null);
  const [draggedCell, setDraggedCell] = useState<{ rowIndex: number; dayIndex: number } | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Drag & Drop sensors - must be at top level
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    })
  );

  // Fetch initial data
  useEffect(() => {
    fetchTemplates();
    fetchSubjects();
    fetchTopics();
    
    // Load plan if in edit mode
    if (isEditMode && editPlanId) {
      loadPlanForEdit(editPlanId);
    }
  }, []);

  const loadPlanForEdit = async (planId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/study/plans/${planId}`, {
      });
      
      if (res.ok) {
        const plan = await res.json();
        
        // Populate form with existing plan data
        setName(plan.name);
        setDescription(plan.description || '');
        setExamType(plan.examType);
        setIsTemplate(plan.isTemplate);
        setIsPublic(plan.isPublic || false);
        
        // Load plan data (rows)
        if (plan.planData && plan.planData.rows) {
          setRows(plan.planData.rows);
          setCurrentStep(3); // Go directly to editing
        }
        
        toast({
          title: 'Plan Yüklendi',
          description: 'Plan düzenleme için yüklendi',
        });
      } else {
        toast({
          title: 'Hata',
          description: 'Plan yüklenemedi',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading plan:', error);
      toast({
        title: 'Hata',
        description: 'Plan yüklenirken bir hata oluþtu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter topics when subject changes
  useEffect(() => {
    if (selectedSubjectForTopics) {
      // "Aktiviteler" seçildiðinde COMMON aktiviteleri konu olarak göster
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

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('\/study/plans?isTemplate=true', {
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.filter((t: any) => t.isTemplate));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('\/subjects', {
      });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('\/subjects/topics/all', {
      });
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };



  const handleExamTypeChange = (value: string) => {
    setExamType(value);
  };



  const canProceedToStep2 = () => {
    return name && examType;
  };

  const canProceedToStep3 = () => {
    return true; // Template selection is optional
  };

  const goToStep2 = () => {
    if (!canProceedToStep2()) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen plan adý ve sýnav tipi seçin',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(2);
  };

  const goToStep3 = () => {
    setCurrentStep(3);
    // Initialize with empty row if no template selected
    if (rows.length === 0) {
      if (selectedTemplate?.planData?.rows) {
        setRows(selectedTemplate.planData.rows);
      } else {
        addRow();
      }
    }
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
      // Only save if at least one field has value
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

  const copyCellToClipboard = (rowIndex: number, dayIndex: number) => {
    const cellData = rows[rowIndex]?.cells[dayIndex];
    if (!cellData) return;

    setEditingCellData({ ...cellData });
    toast({
      title: 'Kopyalandý',
      description: 'Hücre içeriði panoya kopyalandý. Baþka bir hücreye yapýþtýrabilirsiniz.',
    });
  };

  const pasteCellData = (rowIndex: number, dayIndex: number) => {
    if (!editingCellData || Object.keys(editingCellData).length === 0) {
      toast({
        title: 'Yapýþtýrýlamadý',
        description: 'Önce bir hücreyi kopyalayýn.',
        variant: 'destructive',
      });
      return;
    }

    setRows(prev => {
      const newRows = [...prev];
      newRows[rowIndex].cells[dayIndex] = { ...editingCellData };
      return newRows;
    });

    toast({
      title: 'Yapýþtýrýldý',
      description: 'Hücre içeriði baþarýyla yapýþtýrýldý.',
    });
  };

  const deleteCell = (rowIndex: number, dayIndex: number) => {
    setRows(prev => {
      const newRows = [...prev];
      newRows[rowIndex].cells[dayIndex] = null;
      return newRows;
    });
  };

  const duplicateToAllDays = (rowIndex: number, dayIndex: number) => {
    const cellData = rows[rowIndex]?.cells[dayIndex];
    if (!cellData) return;

    setRows(prev => {
      const newRows = [...prev];
      for (let i = 0; i < 7; i++) {
        newRows[rowIndex].cells[i] = { ...cellData };
      }
      return newRows;
    });

    toast({
      title: 'Tüm Günlere Kopyalandý',
      description: 'Hücre içeriði tüm günlere baþarýyla kopyalandý.',
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Parse IDs (format: "cell-rowIndex-dayIndex")
    const [, activeRow, activeDay] = active.id.toString().split('-').map(Number);
    const [, overRow, overDay] = over.id.toString().split('-').map(Number);

    if (isNaN(activeRow) || isNaN(activeDay) || isNaN(overRow) || isNaN(overDay)) return;

    const activeCellData = rows[activeRow]?.cells[activeDay];
    const overCellData = rows[overRow]?.cells[overDay];

    // Swap cells
    setRows(prev => {
      const newRows = [...prev];
      newRows[activeRow].cells[activeDay] = overCellData;
      newRows[overRow].cells[overDay] = activeCellData;
      return newRows;
    });
  };

  const buildPlanData = () => {
    return {
      rows: rows.map(row => ({
        id: row.id,
        cells: row.cells.map(cell => cell || null)
      }))
    };
  };

  const savePlan = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      // Create plan as template or active plan based on checkbox
      const planPayload = {
        name,
        description,
        examType,
        planData: buildPlanData(),
        status: 'DRAFT',
        isTemplate, // Use checkbox value
        isPublic: isTemplate ? isPublic : false, // Only templates can be public
      };

      const url = isEditMode 
        ? `${API_BASE_URL}/study/plans/${editPlanId}`
        : '\/study/plans';
      
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planPayload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Plan oluþturulurken hata oluþtu');
      }

      toast({
        title: 'Baþarýlý',
        description: isEditMode
          ? 'Plan baþarýyla güncellendi'
          : isTemplate
            ? 'Çalýþma planý þablon olarak kaydedildi. Artýk öðrencilere atayabilirsiniz.'
            : 'Çalýþma planý aktif plan olarak kaydedildi.',
      });

      router.push('/dashboard/study-plans');
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluþtu',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Render Step 1: Plan Info (No Target Selection)
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Plan Adý *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="örn. TYT Matematik Yoðun Çalýþma"
          />
        </div>

        {/* Exam Type */}
        <div className="space-y-2">
          <Label>Sýnav Tipi *</Label>
          <Select value={examType} onValueChange={handleExamTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sýnav tipi seçin" />
            </SelectTrigger>
            <SelectContent>
              {EXAM_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Açýklama</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Plan hakkýnda detaylý açýklama..."
          rows={2}
        />
      </div>

      {/* Template Checkbox */}
      <div className="space-y-2">
        <Label>Plan Tipi</Label>
        <div className="flex items-center space-x-4 p-4 border rounded-lg">
          <Switch
            id="isTemplate"
            checked={isTemplate}
            onCheckedChange={setIsTemplate}
          />
          <div className="flex-1">
            <Label htmlFor="isTemplate" className="flex items-center gap-2 cursor-pointer">
              {isTemplate ? (
                <>
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>Þablon Olarak Kaydet</span>
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Aktif Plan Olarak Kaydet</span>
                </>
              )}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {isTemplate
                ? 'Bu plan þablon olarak kaydedilecek ve ilerleyen zamanlarda tekrar kullanýlabilecek.'
                : 'Bu plan doðrudan aktif plan olarak kaydedilecek ve þablon olarak kullanýlamayacak.'}
            </p>
          </div>
        </div>
      </div>

      {/* Public/Private Toggle - Only show for templates */}
      {isTemplate && (
        <div className="space-y-2">
          <Label>Plan Görünürlüðü</Label>
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <div className="flex-1">
              <Label htmlFor="isPublic" className="flex items-center gap-2 cursor-pointer">
                {isPublic ? (
                  <>
                    <Globe className="h-4 w-4 text-green-600" />
                    <span>Okuldaki Tüm Öðretmenlerle Paylaþ</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span>Sadece Ben Görebileyim</span>
                  </>
                )}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {isPublic
                  ? 'Bu plan okuldaki diðer öðretmenler tarafýndan da görülebilir ve kullanýlabilir.'
                  : 'Bu plan sadece sizin tarafýnýzdan görülebilir ve düzenlenebilir.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button onClick={goToStep2} disabled={!canProceedToStep2()}>
          Devam Et
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Render Step 2: Template Selection
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empty Table Option */}
        <Card
          className={`cursor-pointer hover:border-primary transition-colors ${!selectedTemplate ? 'border-primary bg-primary/5' : ''}`}
          onClick={() => setSelectedTemplate(null)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Boþ Tablo Baþlat</CardTitle>
            <CardDescription>Sýfýrdan yeni bir çalýþma planý oluþtur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-lg">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        {templates
          .filter(t => t.examType === examType)
          .map(template => (
            <Card
              key={template.id}
              className={`cursor-pointer hover:border-primary transition-colors ${selectedTemplate?.id === template.id ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline">{template.examType}</Badge>
                </div>
                <CardDescription>{template.description || 'Þablon açýklamasý yok'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {template.gradeLevels.map(g => (
                    <Badge key={g} variant="secondary" className="text-xs">{g}. Sýnýf</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {templates.filter(t => t.examType === examType).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Bu sýnav tipi için þablon bulunmuyor.
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <Button onClick={goToStep3}>
          Devam Et
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Render Step 3: Table Editing
  const renderStep3 = () => {
    // Helper component for draggable cell
    const DraggableCell = ({ cell, rowIndex, dayIndex }: { cell: CellData | null; rowIndex: number; dayIndex: number }) => {
      const cellId = `cell-${rowIndex}-${dayIndex}`;
      const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
      } = useSortable({ id: cellId });

      const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      };

      return (
        <div
          ref={setNodeRef}
          style={style}
          className="relative group"
        >
          <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 bg-white/90 hover:bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {cell && (
                  <>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyCellToClipboard(rowIndex, dayIndex); }}>
                      <CopyIcon className="mr-2 h-4 w-4" />
                      Kopyala
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateToAllDays(rowIndex, dayIndex); }}>
                      <CopyIcon className="mr-2 h-4 w-4" />
                      Tüm Günlere Kopyala
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {editingCellData && Object.keys(editingCellData).length > 0 && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); pasteCellData(rowIndex, dayIndex); }}>
                    <FileText className="mr-2 h-4 w-4" />
                    Yapýþtýr
                  </DropdownMenuItem>
                )}
                {cell && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); deleteCell(rowIndex, dayIndex); }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Sil
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button
            type="button"
            onClick={() => openCellModal(rowIndex, dayIndex)}
            {...attributes}
            {...listeners}
            className={`w-full min-h-[60px] p-2 rounded-md text-left text-sm transition-colors cursor-move ${cell
              ? 'bg-primary/10 hover:bg-primary/20 border border-primary/30'
              : 'bg-muted/50 hover:bg-muted border border-dashed border-muted-foreground/30'
              }`}
          >
            {cell ? (
              <div className="space-y-1">
                {cell.subjectName && (
                  <div className="font-medium truncate">{cell.subjectName}</div>
                )}
                {cell.topicName && (
                  <div className="text-xs text-muted-foreground truncate">{cell.topicName}</div>
                )}
                <div className="flex gap-2 text-xs">
                  {cell.targetQuestionCount && (
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" />
                      {cell.targetQuestionCount}
                    </span>
                  )}
                  {cell.targetDuration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {cell.targetDuration}dk
                    </span>
                  )}
                </div>
                {cell.customContent && (
                  <div className="text-xs text-blue-600 truncate mt-1 border-t border-blue-100 pt-1 font-medium">
                    {cell.customContent}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <Plus className="h-4 w-4" />
              </div>
            )}
          </button>
        </div>
      );
    };

    // Generate all cell IDs for sortable context
    const allCellIds = rows.flatMap((row, rowIndex) =>
      row.cells.map((_, dayIndex) => `cell-${rowIndex}-${dayIndex}`)
    );

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allCellIds} strategy={rectSortingStrategy}>
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Hücre Ýþlemleri:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Hücreleri sürükleyip günler ve satýrlar arasý taþýyabilirsiniz</li>
                    <li>Sað üstteki ? menüsünden hücreyi kopyala/yapýþtýr/sil iþlemlerini yapabilirsiniz</li>
                    <li>"Tüm Günlere Kopyala" ile bir hücreyi hafta boyunca tekrarlayabilirsiniz</li>
                    <li>Hücreye týklayarak detaylarýný düzenleyebilirsiniz</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 text-left font-medium w-16">#</th>
                    {DAYS.map((day, index) => (
                      <th key={day} className="p-3 text-left font-medium min-w-[140px]">
                        <div>{day}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                          Gün {index + 1}
                        </div>
                      </th>
                    ))}
                    <th className="p-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-3 text-muted-foreground">{rowIndex + 1}</td>
                      {row.cells.map((cell, dayIndex) => (
                        <td key={dayIndex} className="p-2">
                          <DraggableCell cell={cell} rowIndex={rowIndex} dayIndex={dayIndex} />
                        </td>
                      ))}
                      <td className="p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(rowIndex)}
                          disabled={rows.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Row Button */}
            <Button type="button" variant="outline" onClick={addRow} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Satýr Ekle
            </Button>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
              <Button
                onClick={() => savePlan()}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Kaydediliyor...' : 'Planý Kaydet'}
              </Button>
            </div>

            {/* Cell Edit Modal */}
            <Dialog open={cellModalOpen} onOpenChange={setCellModalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCell && `${DAYS[selectedCell.dayIndex]} - Satýr ${selectedCell.rowIndex + 1}`}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Subject */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Çalýþýlacak Ders
                    </Label>
                    <Select
                      value={selectedSubjectForTopics}
                      onValueChange={(value) => {
                        setSelectedSubjectForTopics(value);
                        setEditingCellData(prev => ({ ...prev, subjectName: value, topicName: '' }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ders seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Seçilen sýnav tipine ait dersler */}
                        {subjects
                          .filter(s => s.examType === examType)
                          .map(subject => (
                            <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                          ))}
                        {/* Aktiviteler grubu */}
                        {subjects.some(s => s.examType === 'COMMON') && (
                          <>
                            <SelectItem value="---" disabled className="font-semibold text-muted-foreground border-t mt-2 pt-2">
                              ¦¦ Aktiviteler ¦¦
                            </SelectItem>
                            <SelectItem value="Aktiviteler" className="font-medium text-orange-600">
                              ?? Aktiviteler (Tatil, Mola, vb.)
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic / Aktivite */}
                  <div className="space-y-2">
                    <Label>{selectedSubjectForTopics === 'Aktiviteler' ? 'Aktivite Türü' : 'Konu'}</Label>
                    <Select
                      value={editingCellData.topicName || ''}
                      onValueChange={(value) => setEditingCellData(prev => ({ ...prev, topicName: value }))}
                      disabled={!selectedSubjectForTopics}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedSubjectForTopics
                            ? "Önce ders seçin"
                            : selectedSubjectForTopics === 'Aktiviteler'
                              ? "Aktivite seçin"
                              : "Konu seçin"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Group topics by hierarchy */}
                        {(() => {
                          // Find root topics (units) and child topics
                          const rootTopics = filteredTopics.filter(t => !t.parentTopicId);
                          const childTopics = filteredTopics.filter(t => t.parentTopicId);

                          // If no hierarchy (all roots or no roots logic match), just list them
                          if (rootTopics.length === 0 && childTopics.length > 0) {
                            return childTopics.map(topic => (
                              <SelectItem key={topic.id} value={topic.name}>{topic.name}</SelectItem>
                            ));
                          }

                          if (rootTopics.length === 0 && childTopics.length === 0) {
                            return <div className="p-2 text-sm text-muted-foreground">Konu bulunamadý</div>;
                          }

                          return (
                            <>
                              {rootTopics.map(root => {
                                const children = childTopics.filter(c => c.parentTopicId === root.id);
                                return (
                                  <div key={root.id}>
                                    <SelectItem value={root.name} className="font-semibold text-primary/80">
                                      {root.name}
                                    </SelectItem>
                                    {children.map(child => (
                                      <SelectItem key={child.id} value={child.name} className="pl-6 text-sm">
                                        • {child.name}
                                      </SelectItem>
                                    ))}
                                  </div>
                                );
                              })}
                              {/* Orphan children (shouldn't happen strictly but safe to handle) */}
                              {childTopics.filter(c => !rootTopics.find(r => r.id === c.parentTopicId)).map(orphan => (
                                <SelectItem key={orphan.id} value={orphan.name}>{orphan.name}</SelectItem>
                              ))}
                            </>
                          );
                        })()}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question Count */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Hedeflenen Soru Sayýsý
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Örn: 20"
                      value={editingCellData.targetQuestionCount || ''}
                      onChange={(e) => setEditingCellData(prev => ({
                        ...prev,
                        targetQuestionCount: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hedeflenen Süre (dakika)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Örn: 45"
                      value={editingCellData.targetDuration || ''}
                      onChange={(e) => setEditingCellData(prev => ({
                        ...prev,
                        targetDuration: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                    />
                  </div>

                  {/* Resource */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Kaynak Kitap
                    </Label>
                    <Input
                      placeholder="Örn: Karekök Yayýnlarý TYT Matematik"
                      value={editingCellData.targetResource || ''}
                      onChange={(e) => setEditingCellData(prev => ({ ...prev, targetResource: e.target.value }))}
                    />
                  </div>

                  {/* Custom Content */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Özel Ýçerik / Not
                    </Label>
                    <Textarea
                      placeholder="Örn: Video izle, Sayfa 45-50 arasý oku..."
                      value={editingCellData.customContent || ''}
                      onChange={(e) => setEditingCellData(prev => ({ ...prev, customContent: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={clearCellData}>
                    Temizle
                  </Button>
                  <Button type="button" onClick={saveCellData}>
                    Kaydet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Yeni Çalýþma Planý Oluþtur</h1>
        <p className="text-muted-foreground">Öðrencileriniz için detaylý bir çalýþma planý hazýrlayýn</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
            <div className={`w-24 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-2 gap-16 text-sm">
          <span className={currentStep === 1 ? 'font-medium' : 'text-muted-foreground'}>Plan Bilgileri</span>
          <span className={currentStep === 2 ? 'font-medium' : 'text-muted-foreground'}>Þablon Seçimi</span>
          <span className={currentStep === 3 ? 'font-medium' : 'text-muted-foreground'}>Tablo Düzenleme</span>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewStudyPlanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <NewStudyPlanContent />
    </Suspense>
  );
}
