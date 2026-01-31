'use client';

import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function ExamCalendarSettings() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        showPublisher: false,
        showBroughtBy: false,
        showFee: false,
        showParticipantCounts: true,
        notifyDaysBefore: 3,
        autoPublishDaysAfter: 0,
        defaultView: 'table',
        academicYearStart: 6,
    });
    const { toast } = useToast();

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
        if (open) {
            fetchSettings();
        }
    }, [open]);

    const fetchSettings = async () => {
        const schoolId = getSchoolId();
        if (!schoolId) return;

        try {
            const response = await fetch(
                `http://localhost:3001/exams/calendar/settings?schoolId=${schoolId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleSave = async () => {
        const schoolId = getSchoolId();
        if (!schoolId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3001/exams/calendar/settings?schoolId=${schoolId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(settings),
                }
            );

            if (response.ok) {
                toast({
                    title: 'Başarılı',
                    description: 'Ayarlar güncellendi',
                });
                setOpen(false);
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ayarlar güncellenirken bir hata oluştu',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Deneme Takvimi Ayarları</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Öğrencilere Gösterilecek Alanlar */}
                    <div>
                        <h3 className="font-semibold mb-3">Öğrencilere Gösterilecek Bilgiler</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="showPublisher"
                                    checked={settings.showPublisher}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, showPublisher: checked as boolean })
                                    }
                                />
                                <Label htmlFor="showPublisher" className="font-normal">
                                    Yayın Evi
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="showBroughtBy"
                                    checked={settings.showBroughtBy}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, showBroughtBy: checked as boolean })
                                    }
                                />
                                <Label htmlFor="showBroughtBy" className="font-normal">
                                    Getiren Kişi
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="showFee"
                                    checked={settings.showFee}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, showFee: checked as boolean })
                                    }
                                />
                                <Label htmlFor="showFee" className="font-normal">
                                    Ücret Bilgisi
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="showParticipantCounts"
                                    checked={settings.showParticipantCounts}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            showParticipantCounts: checked as boolean,
                                        })
                                    }
                                />
                                <Label htmlFor="showParticipantCounts" className="font-normal">
                                    Katılım Sayıları
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Bildirim Ayarları */}
                    <div>
                        <h3 className="font-semibold mb-3">Bildirim Ayarları</h3>
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="notifyDaysBefore">
                                    Sınavdan Kaç Gün Önce Bildir
                                </Label>
                                <Input
                                    id="notifyDaysBefore"
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={settings.notifyDaysBefore}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            notifyDaysBefore: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Öğrencilere otomatik mesaj gönderilir
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="autoPublishDaysAfter">
                                    Sonuçları Kaç Gün Sonra Yayınla
                                </Label>
                                <Input
                                    id="autoPublishDaysAfter"
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={settings.autoPublishDaysAfter}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            autoPublishDaysAfter: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    0 = Manuel yayınlama
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Görünüm Ayarları */}
                    <div>
                        <h3 className="font-semibold mb-3">Görünüm Ayarları</h3>
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="defaultView">Varsayılan Görünüm</Label>
                                <Select
                                    value={settings.defaultView}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, defaultView: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="table">Tablo</SelectItem>
                                        <SelectItem value="calendar">Takvim</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="academicYearStart">Akademik Yıl Başlangıcı</Label>
                                <Select
                                    value={settings.academicYearStart.toString()}
                                    onValueChange={(value) =>
                                        setSettings({
                                            ...settings,
                                            academicYearStart: parseInt(value),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">Haziran</SelectItem>
                                        <SelectItem value="7">Temmuz</SelectItem>
                                        <SelectItem value="8">Ağustos</SelectItem>
                                        <SelectItem value="9">Eylül</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            İptal
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
