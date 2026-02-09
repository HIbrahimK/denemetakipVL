'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface EditExamModalProps {
    exam: any;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditExamModal({ exam, open, onClose, onSuccess }: EditExamModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        type: 'TYT',
        publisher: '',
        gradeLevel: 12,
        scheduledDateTime: '',
        applicationDateTime: '',
        broughtBy: '',
        quantity: '',
        fee: '',
        isPaid: false,
        color: '#3b82f6',
        isPublished: true,
        isPublisherVisible: false,
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (exam) {
            setFormData({
                title: exam.title || '',
                type: exam.type || 'TYT',
                publisher: exam.publisher || '',
                gradeLevel: exam.gradeLevel || 12,
                scheduledDateTime: exam.scheduledDateTime 
                    ? new Date(exam.scheduledDateTime).toISOString().slice(0, 16)
                    : '',
                applicationDateTime: exam.applicationDateTime
                    ? new Date(exam.applicationDateTime).toISOString().slice(0, 16)
                    : '',
                broughtBy: exam.broughtBy || '',
                quantity: exam.quantity?.toString() || '',
                fee: exam.fee?.toString() || '',
                isPaid: exam.isPaid || false,
                color: exam.color || '#3b82f6',
                isPublished: exam.isPublished !== undefined ? exam.isPublished : true,
                isPublisherVisible: exam.isPublisherVisible || false,
            });
        }
    }, [exam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        try {
            const payload = {
                ...formData,
                scheduledDateTime: formData.scheduledDateTime 
                    ? new Date(formData.scheduledDateTime).toISOString()
                    : undefined,
                applicationDateTime: formData.applicationDateTime
                    ? new Date(formData.applicationDateTime).toISOString()
                    : undefined,
                quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
                fee: formData.fee ? parseFloat(formData.fee) : undefined,
                date: formData.scheduledDateTime 
                    ? new Date(formData.scheduledDateTime).toISOString()
                    : new Date().toISOString(),
            };

            const response = await fetch(`http://localhost:3001/exams/${exam.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast({
                    title: 'Başarılı',
                    description: 'Deneme güncellendi',
                });
                onSuccess();
                onClose();
            } else {
                throw new Error('Failed to update exam');
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Deneme güncellenirken bir hata oluştu',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!exam) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Denemeyi Düzenle</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="title">Deneme Adı *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="Örn: Matemito A Denemesi"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="type">Deneme Türü *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TYT">TYT</SelectItem>
                                    <SelectItem value="AYT">AYT</SelectItem>
                                    <SelectItem value="LGS">LGS</SelectItem>
                                    <SelectItem value="OZEL">Özel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="gradeLevel">Sınıf Seviyesi *</Label>
                            <Select
                                value={formData.gradeLevel.toString()}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, gradeLevel: parseInt(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                                        <SelectItem key={grade} value={grade.toString()}>
                                            {grade}. Sınıf
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="publisher">Yayın</Label>
                            <Input
                                id="publisher"
                                value={formData.publisher}
                                onChange={(e) =>
                                    setFormData({ ...formData, publisher: e.target.value })
                                }
                                placeholder="Örn: Matemito"
                            />
                        </div>

                        <div>
                            <Label htmlFor="color">Renk</Label>
                            <Input
                                id="color"
                                type="color"
                                value={formData.color}
                                onChange={(e) =>
                                    setFormData({ ...formData, color: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="scheduledDateTime">Sınav Tarihi</Label>
                            <Input
                                id="scheduledDateTime"
                                type="datetime-local"
                                value={formData.scheduledDateTime}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        scheduledDateTime: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="applicationDateTime">Uygulama Tarihi</Label>
                            <Input
                                id="applicationDateTime"
                                type="datetime-local"
                                value={formData.applicationDateTime}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        applicationDateTime: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="broughtBy">Getiren Kişi</Label>
                            <Input
                                id="broughtBy"
                                value={formData.broughtBy}
                                onChange={(e) =>
                                    setFormData({ ...formData, broughtBy: e.target.value })
                                }
                                placeholder="Örn: Ahmet Hoca"
                            />
                        </div>

                        <div>
                            <Label htmlFor="quantity">Adet</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={(e) =>
                                    setFormData({ ...formData, quantity: e.target.value })
                                }
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <Label htmlFor="fee">Ücret (₺)</Label>
                            <Input
                                id="fee"
                                type="number"
                                step="0.01"
                                value={formData.fee}
                                onChange={(e) =>
                                    setFormData({ ...formData, fee: e.target.value })
                                }
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPaid"
                                checked={formData.isPaid}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isPaid: checked as boolean })
                                }
                            />
                            <Label htmlFor="isPaid" className="cursor-pointer">
                                Ödendi
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPublished"
                                checked={formData.isPublished}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isPublished: checked as boolean })
                                }
                            />
                            <Label htmlFor="isPublished" className="cursor-pointer">
                                Yayınla (Öğrencilere Görünsün)
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPublisherVisible"
                                checked={formData.isPublisherVisible}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        isPublisherVisible: checked as boolean,
                                    })
                                }
                            />
                            <Label htmlFor="isPublisherVisible" className="cursor-pointer">
                                Yayın Adı Görünsün
                            </Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            İptal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Güncelleniyor...' : 'Güncelle'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
