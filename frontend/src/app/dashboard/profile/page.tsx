"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Key, Lock, Image } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// DiceBear avatar styles and sample seeds
const AVATAR_STYLES = [
    { id: 'avataaars', name: 'Avataaars', seeds: ['Felix', 'Aneka', 'Luna', 'Max', 'Sophie', 'Oliver', 'Emma', 'Jack'] },
    { id: 'bottts', name: 'Robots', seeds: ['Bot1', 'Bot2', 'Bot3', 'Bot4', 'Bot5', 'Bot6', 'Bot7', 'Bot8'] },
    { id: 'personas', name: 'Personas', seeds: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'] },
    { id: 'lorelei', name: 'Lorelei', seeds: ['Aria', 'Bella', 'Clara', 'Daisy', 'Ella', 'Fiona', 'Gwen', 'Holly'] },
    { id: 'micah', name: 'Micah', seeds: ['Sam1', 'Sam2', 'Sam3', 'Sam4', 'Sam5', 'Sam6', 'Sam7', 'Sam8'] },
    { id: 'adventurer', name: 'Adventurer', seeds: ['Hero1', 'Hero2', 'Hero3', 'Hero4', 'Hero5', 'Hero6', 'Hero7', 'Hero8'] },
];

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Branch update
    const [branch, setBranch] = useState("");
    const [branchMessage, setBranchMessage] = useState("");

    // Avatar selection
    const [selectedStyle, setSelectedStyle] = useState('avataaars');
    const [selectedSeed, setSelectedSeed] = useState('');
    const [avatarMessage, setAvatarMessage] = useState("");

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("${API_BASE_URL}/auth/me", {
                    headers: {
                    },
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                    setBranch(userData.branch || "");
                    
                    // Update localStorage with fresh data
                    localStorage.setItem("user", JSON.stringify(userData));
                    
                    // Set avatar seed if exists
                    if (userData.avatarSeed) {
                        const parts = userData.avatarSeed.split(':');
                        if (parts.length === 2) {
                            setSelectedStyle(parts[0]);
                            setSelectedSeed(parts[1]);
                        }
                    } else {
                        // Default to first name as seed
                        setSelectedSeed(userData.firstName);
                    }
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Yeni şifreler eşleşmiyor!");
            return;
        }

        if (newPassword.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır!");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("${API_BASE_URL}/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            if (res.ok) {
                setMessage("Şifreniz başarıyla değiştirildi!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json();
                setError(data.message || "Şifre değiştirilemedi!");
            }
        } catch (error) {
            setError("Bir hata oluştu!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpdate = async () => {
        setAvatarMessage("");
        const token = localStorage.getItem("token");
        const avatarSeed = `${selectedStyle}:${selectedSeed}`;

        try {
            const res = await fetch("${API_BASE_URL}/auth/update-avatar", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ avatarSeed }),
            });

            if (res.ok) {
                const data = await res.json();
                // Update user in localStorage
                const updatedUser = { ...user, avatarSeed };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
                setAvatarMessage("Profil fotoğrafınız güncellendi!");
                
                // Reload page to update sidebar avatar
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setAvatarMessage("Profil fotoğrafı güncellenemedi!");
            }
        } catch (error) {
            setAvatarMessage("Bir hata oluştu!");
            console.error(error);
        }
    };

    const handleBranchUpdate = async () => {
        setBranchMessage("");
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE_URL}/profile/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ branch }),
            });

            if (res.ok) {
                const data = await res.json();
                // Update user in localStorage
                const updatedUser = { ...user, branch };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
                setBranchMessage("Branş bilginiz güncellendi!");
                
                // Reload page to update sidebar
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setBranchMessage("Branş bilgisi güncellenemedi!");
            }
        } catch (error) {
            setBranchMessage("Bir hata oluştu!");
            console.error(error);
        }
    };

    const getAvatarUrl = (style: string, seed: string) => {
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    };

    const getCurrentAvatarUrl = () => {
        if (user?.avatarSeed) {
            const parts = user.avatarSeed.split(':');
            if (parts.length === 2) {
                return getAvatarUrl(parts[0], parts[1]);
            }
        }
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'User'}`;
    };

    const getRoleLabel = () => {
        if (!user) return "";
        
        // Öğretmen için branş kontrolü
        if (user.role === "TEACHER") {
            return user.branch ? `${user.branch} Öğretmeni` : "Öğretmen";
        }
        
        const roleLabels: Record<string, string> = {
            SCHOOL_ADMIN: "Okul Yöneticisi",
            STUDENT: "Öğrenci",
            PARENT: "Veli",
            SUPER_ADMIN: "Süper Admin"
        };
        return roleLabels[user.role] || user.role;
    };

    const shouldShowEmail = Boolean(user?.email) && user?.role !== "STUDENT" && user?.role !== "PARENT";

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <UserCircle className="h-8 w-8 text-indigo-600" />
                    Profilim
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Profil bilgilerinizi ve Şifrenizi yönetin
                </p>
            </div>

            {/* User Info Card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                        <UserCircle className="h-5 w-5" />
                        Kullanıcı Bilgileri
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-700 dark:text-slate-300">Ad</Label>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {user.firstName}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-700 dark:text-slate-300">Soyad</Label>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {user.lastName}
                            </p>
                        </div>
                        {shouldShowEmail && (
                            <div>
                                <Label className="text-slate-700 dark:text-slate-300">E-posta</Label>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {user.email}
                                </p>
                            </div>
                        )}
                        <div>
                            <Label className="text-slate-700 dark:text-slate-300">Rol</Label>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {getRoleLabel()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Branch Update Card for Teachers */}
            {user.role === "TEACHER" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5" />
                            Branş Bilgisi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {branchMessage && (
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg text-green-700 dark:text-green-300">
                                {branchMessage}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="branch">Branşınız</Label>
                            <Input
                                id="branch"
                                placeholder="Örn: Matematik, Türkçe, Fizik"
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Branş bilginiz dashboard'da isminizin altında görüntülenecektir.
                            </p>
                        </div>
                        <Button onClick={handleBranchUpdate} className="bg-indigo-600 hover:bg-indigo-700">
                            Branşı Güncelle
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Avatar Selection Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Profil Fotoğrafı
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {avatarMessage && (
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg text-green-700 dark:text-green-300">
                            {avatarMessage}
                        </div>
                    )}

                    {/* Current Avatar */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-700 shadow-lg">
                            <AvatarImage src={getCurrentAvatarUrl()} />
                            <AvatarFallback className="bg-indigo-500 text-white text-xl">
                                {user?.firstName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Mevcut Profil Fotoğrafın</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Aşağıdan yeni bir fotoğraf seçebilirsin
                            </p>
                        </div>
                    </div>

                    {/* Style Selector */}
                    <div className="space-y-3">
                        <Label>Fotoğraf Stili</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {AVATAR_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => {
                                        setSelectedStyle(style.id);
                                        setSelectedSeed(style.seeds[0]);
                                    }}
                                    className={`p-3 rounded-xl border-2 transition-all ${
                                        selectedStyle === style.id
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                    }`}
                                >
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{style.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Avatar Preview Grid */}
                    <div className="space-y-3">
                        <Label>Fotoğraf Seç</Label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                            {AVATAR_STYLES.find(s => s.id === selectedStyle)?.seeds.map((seed) => (
                                <button
                                    key={seed}
                                    onClick={() => setSelectedSeed(seed)}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all hover:scale-105 ${
                                        selectedSeed === seed
                                            ? 'border-indigo-600 ring-4 ring-indigo-200 dark:ring-indigo-900'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <img
                                        src={getAvatarUrl(selectedStyle, seed)}
                                        alt={seed}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleAvatarUpdate}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                        Profil Fotoğrafını Güncelle
                    </Button>
                </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Şifre Değiştir
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {message && (
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg text-green-700 dark:text-green-300">
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    required
                                    className="pl-10"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Yeni Şifre</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="newPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="pl-10"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="pl-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                        >
                            {loading ? "Göncelleniyor..." : "Şifreyi Güncelle"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
