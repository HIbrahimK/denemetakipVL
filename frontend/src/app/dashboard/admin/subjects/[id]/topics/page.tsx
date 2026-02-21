'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  Loader2,
  Layers,
  FolderTree,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/auth';

interface Topic {
  id: string;
  name: string;
  subjectId: string;
  parentTopicId: string | null;
  order: number;
  createdAt: string;
  childTopics?: Topic[];
}

interface Subject {
  id: string;
  name: string;
  examType: string;
}

// Topic Item Component
function TopicItem({
  topic,
  level,
  onEdit,
  onDelete,
  onAddChild,
}: {
  topic: Topic;
  level: number;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
  onAddChild: (parentId: string) => void;
}) {
  const indent = Math.min(level, 4) * 16;

  return (
    <div>
      <div 
        className="group flex flex-col gap-2 p-3 border rounded-lg hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="flex w-full min-w-0 items-center gap-3">
          <div className="text-muted-foreground text-sm w-6">
            {topic.order + 1}
          </div>
          <span className="font-medium break-words">{topic.name}</span>
        </div>
        <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-full sm:w-auto"
            onClick={() => onAddChild(topic.id)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Alt Konu
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onEdit(topic)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(topic)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {topic.childTopics && topic.childTopics.length > 0 && (
        <div className="mt-2 space-y-2">
          {topic.childTopics.map(child => (
            <TopicItem
              key={child.id}
              topic={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTopicsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const subjectId = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    parentTopicId: '' as string | null,
    order: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

  useEffect(() => {
    fetchSubject();
    fetchTopics();
  }, [subjectId]);

  const fetchSubject = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
      });

      if (res.ok) {
        const data = await res.json();
        setSubject(data);
      }
    } catch (error) {
      console.error('Error fetching subject:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/subjects/topics/all?subjectId=${subjectId}`, {
      });

      if (res.ok) {
        const data = await res.json();
        // Build hierarchy
        const topicMap = new Map<string, Topic>();
        data.forEach((topic: Topic) => {
          topic.childTopics = [];
          topicMap.set(topic.id, topic);
        });
        
        const rootTopics: Topic[] = [];
        data.forEach((topic: Topic) => {
          if (topic.parentTopicId && topicMap.has(topic.parentTopicId)) {
            topicMap.get(topic.parentTopicId)!.childTopics!.push(topic);
          } else {
            rootTopics.push(topic);
          }
        });
        
        setTopics(rootTopics);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (parentTopicId: string | null = null) => {
    setEditingTopic(null);
    setFormData({
      name: '',
      parentTopicId,
      order: topics.length,
    });
    setModalOpen(true);
  };

  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      parentTopicId: topic.parentTopicId,
      order: topic.order,
    });
    setModalOpen(true);
  };

  const openDeleteModal = (topic: Topic) => {
    setTopicToDelete(topic);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: 'Hata',
        description: 'Konu adı zorunludur',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      let url: string;
      let method: string;

      if (editingTopic) {
        url = `${API_BASE_URL}/subjects/topics/${editingTopic.id}`;
        method = 'PATCH';
      } else {
        url = `${API_BASE_URL}/subjects/${subjectId}/topics`;
        method = 'POST';
      }

      const body: any = {
        name: formData.name,
        order: formData.order,
      };

      if (!editingTopic) {
        body.parentTopicId = formData.parentTopicId || undefined;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({
          title: 'Başarılı',
          description: editingTopic ? 'Konu güncellendi' : 'Konu oluşturuldu',
        });
        setModalOpen(false);
        fetchTopics();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Bir hata oluştu');
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!topicToDelete) return;

    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/subjects/topics/${topicToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Başarılı',
          description: 'Konu silindi',
        });
        setDeleteModalOpen(false);
        fetchTopics();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Bir hata oluştu');
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Flatten topics for parent selection
  const getAllTopics = (topicsList: Topic[], level = 0): { topic: Topic; level: number }[] => {
    const result: { topic: Topic; level: number }[] = [];
    const safeLevel = Math.max(0, level); // Ensure level is never negative
    topicsList.forEach(topic => {
      result.push({ topic, level: safeLevel });
      if (topic.childTopics) {
        result.push(...getAllTopics(topic.childTopics, safeLevel + 1));
      }
    });
    return result;
  };

  // Filter topics based on search
  const filterTopics = (topicsList: Topic[]): Topic[] => {
    if (!searchQuery) return topicsList;
    
    return topicsList.filter(topic => {
      const matches = topic.name.toLowerCase().includes(searchQuery.toLowerCase());
      const childMatches = topic.childTopics ? filterTopics(topic.childTopics).length > 0 : false;
      return matches || childMatches;
    }).map(topic => ({
      ...topic,
      childTopics: topic.childTopics ? filterTopics(topic.childTopics) : []
    }));
  };

  const filteredTopics = filterTopics(topics);
  const allTopics = getAllTopics(topics);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/admin/subjects')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Derslere Dön
          </Button>
          <h1 className="text-3xl font-bold mt-4">
            {subject?.name} Konuları
          </h1>
          <p className="text-muted-foreground mt-1">
            {subject?.examType} dersi konu hiyerarşisini yönetin
          </p>
        </div>
        <Button onClick={() => openCreateModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Konu
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Topics Tree */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderTree className="h-5 w-5" />
              <CardTitle>Konu Hiyerarşisi</CardTitle>
            </div>
            <Badge variant="outline">
              {allTopics.length} konu
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz konu eklenmemiş'}
              </h3>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => openCreateModal()}>
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Konuyu Ekle
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTopics.map(topic => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  level={0}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onAddChild={openCreateModal}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTopic ? 'Konu Düzenle' : 'Yeni Konu'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Konu Adı *</Label>
              <Input
                placeholder="Örn: Türev"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {!editingTopic && (
              <div className="space-y-2">
                <Label>Üst Konu (Opsiyonel)</Label>
                <Select 
                  value={formData.parentTopicId || 'null'} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    parentTopicId: value === 'null' ? null : value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ana konu olarak ekle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Ana Konu (Üst konu yok)</SelectItem>
                    {allTopics.map(({ topic, level }) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {'  '.repeat(Math.max(0, level))}{topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Sıralama</Label>
              <Input
                type="number"
                min={0}
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konu Sil</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              <strong>{topicToDelete?.name}</strong> konusunu silmek istediğinize emin misiniz?
            </p>
            {topicToDelete?.childTopics && topicToDelete.childTopics.length > 0 && (
              <p className="text-sm text-destructive mt-2">
                Bu konunun {topicToDelete.childTopics.length} alt konusu var. Silmek alt konuları da silecektir.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
