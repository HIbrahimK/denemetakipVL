"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Megaphone, FileText, Target, BookOpen, Upload, Loader2, Trophy, BarChart3, PlayCircle, HelpCircle, Pin, Pencil, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { API_BASE_URL } from '@/lib/auth';

type BoardPostType = "ANNOUNCEMENT" | "FILE" | "GOAL" | "PLAN" | "POLL" | "VIDEO" | "QUESTION";

const GOAL_TYPE_LABELS: Record<string, string> = {
  SCORE: "Puan",
  TASK: "Görev",
  STUDY_HOURS: "Çalışma Saati",
  CUSTOM: "Özel",
};

const POST_TYPE_LABELS: Record<BoardPostType, string> = {
  ANNOUNCEMENT: "Duyuru",
  FILE: "Dosya",
  GOAL: "Hedef",
  PLAN: "Plan",
  POLL: "Anket",
  VIDEO: "Video",
  QUESTION: "Soru",
};

const QUESTION_LETTERS = ["A", "B", "C", "D", "E"];

const POST_STYLES: Record<BoardPostType, { card: string; badge: string; icon: string }> = {
  ANNOUNCEMENT: {
    card: "border-sky-300/80 bg-sky-100/80 dark:border-sky-700/70 dark:bg-sky-950/45",
    badge: "bg-sky-100 text-sky-800 border-sky-300/70 dark:bg-sky-900/60 dark:text-sky-200 dark:border-sky-700/60",
    icon: "bg-sky-200 text-sky-800 dark:bg-sky-900/70 dark:text-sky-200",
  },
  FILE: {
    card: "border-emerald-300/80 bg-emerald-100/80 dark:border-emerald-700/70 dark:bg-emerald-950/45",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300/70 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700/60",
    icon: "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200",
  },
  GOAL: {
    card: "border-amber-300/80 bg-amber-100/80 dark:border-amber-700/70 dark:bg-amber-950/45",
    badge: "bg-amber-100 text-amber-800 border-amber-300/70 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700/60",
    icon: "bg-amber-200 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200",
  },
  PLAN: {
    card: "border-indigo-300/80 bg-indigo-100/80 dark:border-indigo-700/70 dark:bg-indigo-950/45",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-300/70 dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-700/60",
    icon: "bg-indigo-200 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-200",
  },
  POLL: {
    card: "border-cyan-300/80 bg-cyan-100/80 dark:border-cyan-700/70 dark:bg-cyan-950/45",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-300/70 dark:bg-cyan-900/60 dark:text-cyan-200 dark:border-cyan-700/60",
    icon: "bg-cyan-200 text-cyan-800 dark:bg-cyan-900/70 dark:text-cyan-200",
  },
  VIDEO: {
    card: "border-rose-300/80 bg-rose-100/80 dark:border-rose-700/70 dark:bg-rose-950/45",
    badge: "bg-rose-100 text-rose-800 border-rose-300/70 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700/60",
    icon: "bg-rose-200 text-rose-800 dark:bg-rose-900/70 dark:text-rose-200",
  },
  QUESTION: {
    card: "border-teal-300/80 bg-teal-100/80 dark:border-teal-700/70 dark:bg-teal-950/45",
    badge: "bg-teal-100 text-teal-800 border-teal-300/70 dark:bg-teal-900/60 dark:text-teal-200 dark:border-teal-700/60",
    icon: "bg-teal-200 text-teal-800 dark:bg-teal-900/70 dark:text-teal-200",
  },
};

const POST_SURFACES: Record<
  BoardPostType,
  {
    panel: string;
    soft: string;
    option: string;
    optionSelected: string;
    track: string;
    fill: string;
  }
> = {
  ANNOUNCEMENT: {
    panel: "border-sky-200/70 bg-sky-50/80 dark:border-sky-800/60 dark:bg-sky-900/35",
    soft: "border-sky-200/60 bg-sky-50/60 dark:border-sky-800/50 dark:bg-sky-900/25",
    option:
      "border-sky-200/70 bg-sky-50/70 text-slate-900 dark:text-slate-100 dark:border-sky-800/60 dark:bg-sky-900/35 hover:bg-sky-100/80 dark:hover:bg-sky-900/60",
    optionSelected:
      "border-sky-400 bg-sky-100/90 text-slate-900 dark:text-slate-100 dark:border-sky-400/80 dark:bg-sky-900/70",
    track: "bg-sky-200/70 dark:bg-sky-900/40",
    fill: "bg-sky-500 dark:bg-sky-400",
  },
  FILE: {
    panel: "border-emerald-200/70 bg-emerald-50/80 dark:border-emerald-800/60 dark:bg-emerald-900/35",
    soft: "border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-900/25",
    option:
      "border-emerald-200/70 bg-emerald-50/70 text-slate-900 dark:text-slate-100 dark:border-emerald-800/60 dark:bg-emerald-900/35 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60",
    optionSelected:
      "border-emerald-400 bg-emerald-100/90 text-slate-900 dark:text-slate-100 dark:border-emerald-400/80 dark:bg-emerald-900/70",
    track: "bg-emerald-200/70 dark:bg-emerald-900/40",
    fill: "bg-emerald-500 dark:bg-emerald-400",
  },
  GOAL: {
    panel: "border-amber-200/70 bg-amber-50/80 dark:border-amber-800/60 dark:bg-amber-900/35",
    soft: "border-amber-200/60 bg-amber-50/60 dark:border-amber-800/50 dark:bg-amber-900/25",
    option:
      "border-amber-200/70 bg-amber-50/70 text-slate-900 dark:text-slate-100 dark:border-amber-800/60 dark:bg-amber-900/35 hover:bg-amber-100/80 dark:hover:bg-amber-900/60",
    optionSelected:
      "border-amber-400 bg-amber-100/90 text-slate-900 dark:text-slate-100 dark:border-amber-400/80 dark:bg-amber-900/70",
    track: "bg-amber-200/70 dark:bg-amber-900/40",
    fill: "bg-amber-500 dark:bg-amber-400",
  },
  PLAN: {
    panel: "border-indigo-200/70 bg-indigo-50/80 dark:border-indigo-800/60 dark:bg-indigo-900/35",
    soft: "border-indigo-200/60 bg-indigo-50/60 dark:border-indigo-800/50 dark:bg-indigo-900/25",
    option:
      "border-indigo-200/70 bg-indigo-50/70 text-slate-900 dark:text-slate-100 dark:border-indigo-800/60 dark:bg-indigo-900/35 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60",
    optionSelected:
      "border-indigo-400 bg-indigo-100/90 text-slate-900 dark:text-slate-100 dark:border-indigo-400/80 dark:bg-indigo-900/70",
    track: "bg-indigo-200/70 dark:bg-indigo-900/40",
    fill: "bg-indigo-500 dark:bg-indigo-400",
  },
  POLL: {
    panel: "border-cyan-200/70 bg-cyan-50/80 dark:border-cyan-800/60 dark:bg-cyan-900/35",
    soft: "border-cyan-200/60 bg-cyan-50/60 dark:border-cyan-800/50 dark:bg-cyan-900/25",
    option:
      "border-cyan-200/70 bg-cyan-50/70 text-slate-900 dark:text-slate-100 dark:border-cyan-800/60 dark:bg-cyan-900/35 hover:bg-cyan-100/80 dark:hover:bg-cyan-900/60",
    optionSelected:
      "border-cyan-400 bg-cyan-100/90 text-slate-900 dark:text-slate-100 dark:border-cyan-400/80 dark:bg-cyan-900/70",
    track: "bg-cyan-200/70 dark:bg-cyan-900/40",
    fill: "bg-cyan-500 dark:bg-cyan-400",
  },
  VIDEO: {
    panel: "border-rose-200/70 bg-rose-50/80 dark:border-rose-800/60 dark:bg-rose-900/35",
    soft: "border-rose-200/60 bg-rose-50/60 dark:border-rose-800/50 dark:bg-rose-900/25",
    option:
      "border-rose-200/70 bg-rose-50/70 text-slate-900 dark:text-slate-100 dark:border-rose-800/60 dark:bg-rose-900/35 hover:bg-rose-100/80 dark:hover:bg-rose-900/60",
    optionSelected:
      "border-rose-400 bg-rose-100/90 text-slate-900 dark:text-slate-100 dark:border-rose-400/80 dark:bg-rose-900/70",
    track: "bg-rose-200/70 dark:bg-rose-900/40",
    fill: "bg-rose-500 dark:bg-rose-400",
  },
  QUESTION: {
    panel: "border-teal-200/70 bg-teal-50/80 dark:border-teal-800/60 dark:bg-teal-900/35",
    soft: "border-teal-200/60 bg-teal-50/60 dark:border-teal-800/50 dark:bg-teal-900/25",
    option:
      "border-teal-200/70 bg-teal-50/70 text-slate-900 dark:text-slate-100 dark:border-teal-800/60 dark:bg-teal-900/35 hover:bg-teal-100/80 dark:hover:bg-teal-900/60",
    optionSelected:
      "border-teal-400 bg-teal-100/90 text-slate-900 dark:text-slate-100 dark:border-teal-400/80 dark:bg-teal-900/70",
    track: "bg-teal-200/70 dark:bg-teal-900/40",
    fill: "bg-teal-500 dark:bg-teal-400",
  },
};

interface GroupPost {
  id: string;
  type: BoardPostType;
  title: string | null;
  body: string | null;
  filePath?: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  data?: any;
  isPinned?: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  replies?: GroupPostReply[];
  responses?: GroupPostResponse[];
  responseStats?: {
    total: number;
    counts: Record<string, number>;
  } | null;
  goal?: {
    id: string;
    goalType: string;
    targetData: any;
    deadline?: string | null;
  } | null;
  plan?: {
    id: string;
    name: string;
    examType?: string | null;
    gradeLevels?: number[];
  } | null;
}

interface GroupPostReply {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface GroupPostResponse {
  id: string;
  selectedOption: string;
  isCorrect?: boolean | null;
  pointsAwarded?: number | null;
  student?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  optionTexts?: string[];
  correctOption?: string;
  points?: number;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

type QuestionAnswerMap = Record<string, string>;

interface MentorGroup {
  id: string;
  name: string;
  isActive: boolean;
  maxStudents: number | null;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  goals: Array<{
    id: string;
    goalType: string;
    targetData: any;
    deadline?: string | null;
    isActive: boolean;
    isPublished?: boolean;
    isCompleted?: boolean;
  }>;
}

interface GroupStats {
  memberCount: number;
  completedTasks: number;
  groupGoals: number;
  activeGroupGoals: number;
  totalStudyHours: number;
  avgStudyHoursPerMember: number;
}

interface StudyPlan {
  id: string;
  name: string;
  examType?: string | null;
  gradeLevels?: number[];
}

interface GoalFormState {
  goalType: string;
  title: string;
  targetValue: string;
  unit: string;
  description: string;
  deadline: string;
  isPublished: boolean;
  isCompleted: boolean;
}

interface QuestionDraft {
  id: string;
  question: string;
  optionCount: number;
  optionTexts: string[];
  correctOption: string;
  points: string;
  imageFile: File | null;
  imageMeta: {
    filePath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  } | null;
  imagePreviewUrl: string | null;
}

export default function GroupBoardPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const groupId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<MentorGroup | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<{
    filePath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  } | null>(null);

  const [postType, setPostType] = useState<BoardPostType>("ANNOUNCEMENT");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [pollOptionsText, setPollOptionsText] = useState("");
  const [pollResultsPublic, setPollResultsPublic] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const createEmptyQuestion = (): QuestionDraft => ({
    id: `${Date.now()}-${Math.random()}`,
    question: "",
    optionCount: 5,
    optionTexts: ["", "", "", "", ""],
    correctOption: "",
    points: "10",
    imageFile: null,
    imageMeta: null,
    imagePreviewUrl: null,
  });
  const [questionDrafts, setQuestionDrafts] = useState<QuestionDraft[]>(() => [createEmptyQuestion()]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<GroupPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyBody, setEditingReplyBody] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalFormState>({
    goalType: "TASK",
    title: "",
    targetValue: "",
    unit: "",
    description: "",
    deadline: "",
    isPublished: true,
    isCompleted: false,
  });
  const [savingGoal, setSavingGoal] = useState(false);
  const [questionGroupIndex, setQuestionGroupIndex] = useState<Record<string, number>>({});
  const [questionGroupDrafts, setQuestionGroupDrafts] = useState<Record<string, QuestionAnswerMap>>({});
  const [submittingResponseId, setSubmittingResponseId] = useState<string | null>(null);
  const [expandedQuestionImages, setExpandedQuestionImages] = useState<Record<string, boolean>>({});
  const [expandedFileImages, setExpandedFileImages] = useState<Record<string, boolean>>({});
  const [expandedVideos, setExpandedVideos] = useState<Record<string, boolean>>({});

  const activeQuestion = questionDrafts[activeQuestionIndex] ?? questionDrafts[0];

  useEffect(() => {
    if (activeQuestionIndex >= questionDrafts.length) {
      setActiveQuestionIndex(Math.max(0, questionDrafts.length - 1));
    }
  }, [activeQuestionIndex, questionDrafts.length]);

  const isAdmin = user?.role === "SCHOOL_ADMIN" || user?.role === "SUPER_ADMIN";
  const isGroupTeacher = user?.role === "TEACHER" && user?.id === group?.teacher?.id;
  const canManage = isAdmin || isGroupTeacher;
  const isStudent = user?.role === "STUDENT";

  const updateActiveQuestion = (updater: (draft: QuestionDraft) => QuestionDraft) => {
    setQuestionDrafts((prev) =>
      prev.map((draft, index) => {
        if (index !== activeQuestionIndex) return draft;
        const next = updater(draft);
        const validOptions = ["A", "B", "C", "D", "E"].slice(0, next.optionCount);
        if (next.correctOption && !validOptions.includes(next.correctOption)) {
          return { ...next, correctOption: "" };
        }
        return next;
      }),
    );
  };

  const addQuestionDraft = () => {
    setQuestionDrafts((prev) => {
      const next = [...prev, createEmptyQuestion()];
      setActiveQuestionIndex(next.length - 1);
      return next;
    });
  };

  const removeQuestionDraft = () => {
    setQuestionDrafts((prev) => {
      if (prev.length === 1) return prev;
      const next = prev.filter((_, index) => index !== activeQuestionIndex);
      const nextIndex = Math.min(activeQuestionIndex, next.length - 1);
      setActiveQuestionIndex(nextIndex);
      return next;
    });
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    if (groupId) {
      fetchBoardData();
    }
  }, [groupId]);

  const fetchBoardData = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const localUser = userStr ? JSON.parse(userStr) : null;

      const groupRes = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        headers: {
        },
      });

      if (groupRes.ok) {
        const groupData = await groupRes.json();
        setGroup(groupData);
      }

      const statsRes = await fetch(`${API_BASE_URL}/groups/${groupId}/stats`, {
        headers: {
        },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const postsRes = await fetch(`${API_BASE_URL}/groups/${groupId}/board`, {
        headers: {
        },
      });

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }

      if (localUser?.role === "TEACHER" || localUser?.role === "SCHOOL_ADMIN" || localUser?.role === "SUPER_ADMIN") {
        const plansRes = await fetch(`${API_BASE_URL}/study/plans?status=ACTIVE`, {
          headers: {
          },
        });
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData);
        }
      }
    } catch (error) {
      console.error("Error fetching board data:", error);
      toast({
        title: "Hata",
        description: "Pano verileri yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setSelectedGoalId("");
    setSelectedPlanId("");
    setSelectedFile(null);
    setFileMeta(null);
    setPostType("ANNOUNCEMENT");
    setPollOptionsText("");
    setPollResultsPublic(true);
    setVideoUrl("");
    setQuestionDrafts([createEmptyQuestion()]);
    setActiveQuestionIndex(0);
  };

  const uploadBoardFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/groups/${groupId}/board/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Dosya yüklenemedi");
      }

      return await res.json();
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error instanceof Error ? error.message : "Dosya yüklenemedi";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return null;
    const data = await uploadBoardFile(selectedFile);
    if (data) {
      setFileMeta(data);
    }
    return data;
  };

  const handleCreatePost = async () => {
    setPosting(true);
    try {
      if (postType === "ANNOUNCEMENT" && !title.trim() && !body.trim()) {
        throw new Error("Başlık veya içerik zorunludur");
      }

      if (postType === "FILE" && !selectedFile && !fileMeta) {
        throw new Error("Dosya seçilmelidir");
      }

      if (postType === "GOAL" && !selectedGoalId) {
        throw new Error("Hedef seçilmelidir");
      }

      if (postType === "PLAN" && !selectedPlanId) {
        throw new Error("Çalışma planı seçilmelidir");
      }

      if (postType === "POLL") {
        if (!title.trim()) {
          throw new Error("Anket sorusu zorunludur");
        }
        const options = pollOptionsText
          .split("\n")
          .map((opt) => opt.trim())
          .filter(Boolean);
        if (options.length < 2) {
          throw new Error("En az iki anket seçeneği girilmelidir");
        }
      }

      if (postType === "VIDEO") {
        if (!videoUrl.trim()) {
          throw new Error("YouTube bağlantısı zorunludur");
        }
      }

      if (postType === "QUESTION") {
        if (questionDrafts.length === 0) {
          throw new Error("En az bir soru eklemelisiniz");
        }
        questionDrafts.forEach((draft, index) => {
          const hasImage = !!draft.imageFile || !!draft.imageMeta;
          if (!draft.question.trim() && !hasImage) {
            throw new Error(`Soru ${index + 1} metni veya görseli zorunludur`);
          }
          if (!draft.correctOption.trim()) {
            throw new Error(`Soru ${index + 1} için doğru cevap seçilmelidir`);
          }
          const letters = ["A", "B", "C", "D", "E"].slice(0, draft.optionCount);
          if (!letters.includes(draft.correctOption)) {
            throw new Error(`Soru ${index + 1} için doğru cevap şıklarda olmalıdır`);
          }
        });
      }

      let fileInfo = fileMeta;
      if (postType === "FILE" && !fileInfo) {
        fileInfo = await handleUpload();
        if (!fileInfo) {
          return;
        }
      }

      const sendPayload = async (payload: any) => {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/board`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || "Paylaşım oluşturulamadı";
          throw new Error(errorMessage);
        }
      };

      if (postType === "QUESTION") {
        const questionsPayload = [];
        for (const draft of questionDrafts) {
          const letters = ["A", "B", "C", "D", "E"].slice(0, draft.optionCount);
          const optionTexts = draft.optionTexts.slice(0, draft.optionCount).map((opt) => opt.trim());
          let imageMeta = draft.imageMeta;
          if (!imageMeta && draft.imageFile) {
            imageMeta = await uploadBoardFile(draft.imageFile);
          }
          const questionText = draft.question.trim() || "Görsel Soru";
          questionsPayload.push({
            id: draft.id,
            question: questionText,
            options: letters,
            optionTexts,
            correctOption: draft.correctOption,
            points: Number.isFinite(Number(draft.points)) ? Number(draft.points) : 10,
            ...(imageMeta
              ? {
                  filePath: imageMeta.filePath,
                  fileName: imageMeta.fileName,
                  fileSize: imageMeta.fileSize,
                  mimeType: imageMeta.mimeType,
                }
              : {}),
          });
        }

        const payload = {
          type: postType,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
          data: {
            questions: questionsPayload,
          },
        };

        await sendPayload(payload);

        toast({
          title: "Başarılı",
          description: `${questionDrafts.length} soruluk pano öğesi paylaşıldı`,
        });
      } else {
        const payload: any = {
          type: postType,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
        };

        if (postType === "FILE" && fileInfo) {
          payload.filePath = fileInfo.filePath;
          payload.fileName = fileInfo.fileName;
          payload.fileSize = fileInfo.fileSize;
          payload.mimeType = fileInfo.mimeType;
        }

        if (postType === "GOAL") {
          payload.goalId = selectedGoalId;
        }

        if (postType === "PLAN") {
          payload.planId = selectedPlanId;
        }

        if (postType === "POLL") {
          const options = pollOptionsText
            .split("\n")
            .map((opt) => opt.trim())
            .filter(Boolean);
          payload.data = {
            question: title.trim(),
            options,
            isResultsPublic: pollResultsPublic,
          };
        }

        if (postType === "VIDEO") {
          payload.data = {
            url: videoUrl.trim(),
          };
        }

        await sendPayload(payload);

        toast({
          title: "Başarılı",
          description: "Pano paylaşımı oluşturuldu",
        });
      }
      resetForm();
      await fetchBoardData();
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMessage = error instanceof Error ? error.message : "Paylaşım oluşturulamadı";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleSavePostEdit = async () => {
    if (!editingPost) return;
    if (
      (editingPost.type === "POLL" || (editingPost.type === "QUESTION" && !Array.isArray(editingPost.data?.questions))) &&
      !editTitle.trim()
    ) {
      toast({
        title: "Hata",
        description: "Başlık boş olamaz",
        variant: "destructive",
      });
      return;
    }
    setSavingEdit(true);
    try {
      const payload: any = {
        title: editTitle.trim(),
        body: editBody.trim(),
      };

      if (editingPost.type === "POLL" || (editingPost.type === "QUESTION" && !Array.isArray(editingPost.data?.questions))) {
        payload.data = {
          ...(editingPost.data || {}),
          question: editTitle.trim(),
        };
      }

      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/board/${editingPost.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Paylaşım güncellenemedi");
      }

      toast({
        title: "Başarılı",
        description: "Paylaşım güncellendi",
      });
      setEditingPost(null);
      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Paylaşım güncellenemedi";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const confirmed = window.confirm("Bu paylaşımı silmek istediğinize emin misiniz?");
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/board/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Paylaşım silinemedi");
      }

      toast({
        title: "Başarılı",
        description: "Paylaşım silindi",
      });
      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Paylaşım silinemedi";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (post: GroupPost) => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/board/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Sabitlenemedi");
      }

      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sabitlenemedi";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateReply = async (postId: string, replyId: string) => {
    if (!editingReplyBody.trim()) return;
    setSavingReply(true);
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/board/${postId}/replies/${replyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: editingReplyBody.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Yanıt güncellenemedi");
      }

      setEditingReplyId(null);
      setEditingReplyBody("");
      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Yanıt güncellenemedi";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingReply(false);
    }
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
    const confirmed = window.confirm("Bu yanıtı silmek istediğinize emin misiniz?");
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/board/${postId}/replies/${replyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Yanıt silinemedi");
      }

      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Yanıt silinemedi";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleCreateGoal = async () => {
    if (!goalForm.title.trim()) {
      toast({
        title: "Hata",
        description: "Hedef adı zorunludur",
        variant: "destructive",
      });
      return;
    }

    const targetValue = goalForm.targetValue ? Number(goalForm.targetValue) : undefined;
    if (goalForm.targetValue && !Number.isFinite(targetValue)) {
      toast({
        title: "Hata",
        description: "Hedef değeri geçerli bir sayı olmalıdır",
        variant: "destructive",
      });
      return;
    }

    setSavingGoal(true);
    try {
      const payload: any = {
        goalType: goalForm.goalType,
        targetData: {
          title: goalForm.title.trim(),
          targetValue: Number.isFinite(targetValue) ? targetValue : undefined,
          unit: goalForm.unit || undefined,
          description: goalForm.description || undefined,
        },
        deadline: goalForm.deadline || undefined,
        isPublished: goalForm.isPublished,
        isCompleted: goalForm.goalType === "TASK" ? goalForm.isCompleted : false,
      };

      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Hedef oluşturulamadı");
      }

      toast({
        title: "Başarılı",
        description: "Hedef eklendi",
      });
      setGoalForm({
        goalType: "TASK",
        title: "",
        targetValue: "",
        unit: "",
        description: "",
        deadline: "",
        isPublished: true,
        isCompleted: false,
      });
      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Hedef oluşturulamadı";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingGoal(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/goals/${goalId}/complete`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Görev tamamlanamadı");
      }

      toast({
        title: "Başarılı",
        description: "Görev tamamlandı olarak işaretlendi",
      });
      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Görev tamamlanamadı";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    }
  };

  const getPostIcon = (type: BoardPostType) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return <Megaphone className="h-5 w-5 text-indigo-600" />;
      case "FILE":
        return <FileText className="h-5 w-5 text-emerald-600" />;
      case "GOAL":
        return <Target className="h-5 w-5 text-amber-600" />;
      case "PLAN":
        return <BookOpen className="h-5 w-5 text-purple-600" />;
      case "POLL":
        return <BarChart3 className="h-5 w-5 text-sky-600" />;
      case "VIDEO":
        return <PlayCircle className="h-5 w-5 text-red-600" />;
      case "QUESTION":
        return <HelpCircle className="h-5 w-5 text-teal-600" />;
      default:
        return null;
    }
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString("tr-TR");
  };

  const getGoalTitle = (goal: MentorGroup["goals"][number]) => {
    return goal.targetData?.title || "Hedef";
  };

  const getGoalTargetLabel = (goal: MentorGroup["goals"][number]) => {
    const value = goal.targetData?.targetValue;
    const unit = goal.targetData?.unit;
    if (value === undefined || value === null) {
      return "Hedef değeri belirtilmemiş";
    }
    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  const getGoalTypeLabel = (goalType: string) => {
    return GOAL_TYPE_LABELS[goalType] ?? goalType;
  };

  const publishedGoals = group?.goals.filter((goal) => goal.isActive && goal.isPublished !== false) ?? [];
  const sortedPosts = [...posts].sort((a, b) => {
    const pinDiff = (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
    if (pinDiff !== 0) return pinDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
      }
      if (parsed.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
      }
      if (parsed.pathname.includes("/embed/")) {
        return url;
      }
    } catch {
      return url;
    }
    return url;
  };

  const getQuestionItems = (post: GroupPost): QuestionItem[] => {
    const data = post.data || {};
    if (Array.isArray(data?.questions)) {
      return data.questions.map((question: QuestionItem, index: number) => ({
        id: String(question?.id ?? index),
        question: question?.question || "",
        options: Array.isArray(question?.options) ? question.options : [],
        optionTexts: Array.isArray(question?.optionTexts) ? question.optionTexts : [],
        correctOption: question?.correctOption,
        points: question?.points,
        filePath: question?.filePath,
        fileName: question?.fileName,
        fileSize: question?.fileSize,
        mimeType: question?.mimeType,
      }));
    }

    return [
      {
        id: post.id,
        question: data?.question || post.title || "Soru",
        options: Array.isArray(data?.options) ? data.options : [],
        optionTexts: Array.isArray(data?.optionTexts) ? data.optionTexts : [],
        correctOption: data?.correctOption,
        points: data?.points,
        filePath: post.filePath || undefined,
        fileName: post.fileName || undefined,
        fileSize: post.fileSize || undefined,
        mimeType: post.mimeType || undefined,
      },
    ];
  };

  const parseAnswerPayload = (selectedOption?: string | null): QuestionAnswerMap | null => {
    if (!selectedOption) return null;
    try {
      const parsed = JSON.parse(selectedOption);
      if (parsed && typeof parsed === "object") {
        if (parsed.answers && typeof parsed.answers === "object" && !Array.isArray(parsed.answers)) {
          return parsed.answers as QuestionAnswerMap;
        }
        if (Array.isArray(parsed.answers)) {
          const map: QuestionAnswerMap = {};
          parsed.answers.forEach((entry: any) => {
            if (entry?.questionId && entry?.selectedOption) {
              map[String(entry.questionId)] = String(entry.selectedOption);
            }
          });
          return map;
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  const handleSubmitReply = async (postId: string) => {
    const body = replyDrafts[postId]?.trim();
    if (!body) return;
    setSubmittingReplyId(postId);
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/board/${postId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Yanıt gönderilemedi");
      }

      setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Yanıt gönderilemedi";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleRespond = async (postId: string, option: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/board/${postId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedOption: option }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Cevap gönderilemedi");
      }

      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cevap gönderilemedi";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    }
  };

  const updateQuestionGroupAnswer = (postId: string, questionId: string, option: string) => {
    setQuestionGroupDrafts((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        [questionId]: option,
      },
    }));
  };

  const handleSubmitQuestionGroup = async (post: GroupPost) => {
    const questions = getQuestionItems(post);
    const answers = questionGroupDrafts[post.id] || {};
    const missing = questions.filter((question) => !answers[question.id]);
    if (missing.length > 0) {
      toast({
        title: "Eksik Cevap",
        description: "Lütfen tüm soruları cevaplayın",
        variant: "destructive",
      });
      return;
    }

    setSubmittingResponseId(post.id);
    try {
      const payload = JSON.stringify({ answers });
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/board/${post.id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedOption: payload }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Cevap gönderilemedi");
      }

      await fetchBoardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cevap gönderilemedi";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmittingResponseId(null);
    }
  };

  const toggleQuestionImage = (key: string) => {
    setExpandedQuestionImages((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleFileImage = (key: string) => {
    setExpandedFileImages((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleVideoOverlay = (key: string) => {
    setExpandedVideos((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Grup bulunamadı
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/groups")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{group.name} Panosu</h1>
            <Badge variant={group.isActive ? "default" : "secondary"}>
              {group.isActive ? "Aktif" : "Pasif"}
            </Badge>
          </div>
          {canManage && (
            <p className="text-muted-foreground">
              Mentor: {group.teacher ? `${group.teacher.firstName} ${group.teacher.lastName}` : 'Atanmamış'}
            </p>
          )}
        </div>
        {canManage && (
          <Link href={`/dashboard/groups/${groupId}`}>
            <Button variant="outline">Grup Detayı</Button>
          </Link>
        )}
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="goals" className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-4 dark:border-slate-700 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <AccordionTrigger className="py-4">
            <div className="flex w-full items-center justify-between gap-3 pr-2 text-left">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Aktif Hedefler ve Görevler</div>
                  <div className="text-xs text-muted-foreground">Panoda yayınlanan hedefler</div>
                </div>
              </div>
              <Badge variant="secondary">{publishedGoals.length} hedef</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {publishedGoals.length === 0 ? (
              <div className="text-sm text-muted-foreground">Henüz panoda yayınlanan hedef yok.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {publishedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`rounded-xl border p-3 shadow-sm ${
                      goal.isCompleted
                        ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-700/60 dark:bg-emerald-900/40"
                        : "border-amber-100 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{getGoalTitle(goal)}</div>
                        <div className="text-xs text-muted-foreground">{getGoalTargetLabel(goal)}</div>
                      </div>
                      <Badge variant={goal.isCompleted ? "default" : "outline"}>
                        {goal.isCompleted ? "Tamamlandı" : getGoalTypeLabel(goal.goalType)}
                      </Badge>
                    </div>
                    {goal.targetData?.description && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{goal.targetData.description}</p>
                    )}
                    {goal.deadline && (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Son tarih: {new Date(goal.deadline).toLocaleDateString("tr-TR")}
                      </p>
                    )}
                    {isStudent && goal.goalType === "TASK" && (
                      <Button
                        size="sm"
                        variant={goal.isCompleted ? "outline" : "default"}
                        className="mt-3 w-full"
                        onClick={() => handleCompleteGoal(goal.id)}
                        disabled={goal.isCompleted}
                      >
                        {goal.isCompleted ? "Tamamlandı" : "Tamamladım"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className={`grid grid-cols-1 gap-6 ${canManage ? "lg:grid-cols-[380px_1fr]" : ""}`}>
        {canManage && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Pano Paylaşımı</CardTitle>
              <CardDescription>Grup üyeleriyle duyuru, hedef veya dosya paylaşın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Paylaşım Türü</label>
                <Select value={postType} onValueChange={(value) => setPostType(value as BoardPostType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Paylaşım türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANNOUNCEMENT">Duyuru</SelectItem>
                    <SelectItem value="FILE">Dosya</SelectItem>
                    <SelectItem value="GOAL">Hedef</SelectItem>
                    <SelectItem value="PLAN">Çalışma Planı</SelectItem>
                    <SelectItem value="POLL">Anket</SelectItem>
                    <SelectItem value="QUESTION">Soru</SelectItem>
                    <SelectItem value="VIDEO">YouTube Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {postType === "POLL"
                    ? "Anket Sorusu"
                    : postType === "QUESTION"
                      ? "Soru Grubu Başlığı (Opsiyonel)"
                      : "Başlık"}
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={postType === "QUESTION" ? "Örn: Haftalık Soru Paketi" : "Başlık girin"}
                />
              </div>

              {(postType === "ANNOUNCEMENT" || postType === "FILE" || postType === "PLAN" || postType === "POLL" || postType === "QUESTION" || postType === "VIDEO") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Açıklama</label>
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
                </div>
              )}

              {postType === "POLL" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seçenekler (her satır bir seçenek)</label>
                    <Textarea
                      value={pollOptionsText}
                      onChange={(e) => setPollOptionsText(e.target.value)}
                      rows={4}
                      placeholder={"A seçeneği\nB seçeneği\nC seçeneği"}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <label className="text-sm font-medium">Sonuçlar Görülebilsin</label>
                      <p className="text-xs text-muted-foreground">Öğrenciler anket sonucunu görebilsin</p>
                    </div>
                    <Switch checked={pollResultsPublic} onCheckedChange={setPollResultsPublic} />
                  </div>
                </div>
              )}

              {postType === "QUESTION" && (
                <div className="space-y-4 rounded-lg border border-dashed p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium">
                      Soru {activeQuestionIndex + 1} / {questionDrafts.length}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={activeQuestionIndex === 0}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Önceki
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setActiveQuestionIndex((prev) => Math.min(questionDrafts.length - 1, prev + 1))
                        }
                        disabled={activeQuestionIndex >= questionDrafts.length - 1}
                      >
                        Sonraki
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={addQuestionDraft}>
                        <Plus className="mr-1 h-4 w-4" />
                        Soru Ekle
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeQuestionDraft}
                        disabled={questionDrafts.length === 1}
                      >
                        Soru Sil
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Soru Metni</label>
                    <Input
                      value={activeQuestion?.question || ""}
                      onChange={(e) =>
                        updateActiveQuestion((draft) => ({ ...draft, question: e.target.value }))
                      }
                      placeholder="Soru metnini yazın"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Soru Görseli</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (!file) {
                          updateActiveQuestion((draft) => ({
                            ...draft,
                            imageFile: null,
                            imageMeta: null,
                            imagePreviewUrl: null,
                          }));
                          return;
                        }
                        const previewUrl = URL.createObjectURL(file);
                        updateActiveQuestion((draft) => ({
                          ...draft,
                          imageFile: file,
                          imageMeta: null,
                          imagePreviewUrl: previewUrl,
                        }));
                      }}
                    />
                    {activeQuestion?.imagePreviewUrl && (
                      <div className="overflow-hidden rounded-lg border bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
                        <img
                          src={activeQuestion.imagePreviewUrl}
                          alt="Soru görseli"
                          className="w-full max-h-[520px] object-contain"
                        />
                      </div>
                    )}
                    {activeQuestion?.imageFile && (
                      <div className="text-xs text-muted-foreground">
                        {activeQuestion.imageFile.name} ({Math.round(activeQuestion.imageFile.size / 1024)} KB)
                      </div>
                    )}
                    {activeQuestion?.imagePreviewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateActiveQuestion((draft) => ({
                            ...draft,
                            imageFile: null,
                            imageMeta: null,
                            imagePreviewUrl: null,
                          }))
                        }
                      >
                        Görseli Kaldır
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Şık Sayısı</label>
                    <Select
                      value={String(activeQuestion?.optionCount || 5)}
                      onValueChange={(value) => {
                        const count = Number(value);
                        updateActiveQuestion((draft) => ({
                          ...draft,
                          optionCount: count,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Şık sayısını seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">LGS (4 Şık)</SelectItem>
                        <SelectItem value="5">TYT (5 Şık)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    {(activeQuestion?.optionTexts || [])
                      .slice(0, activeQuestion?.optionCount || 5)
                      .map((opt, index) => (
                      <div key={`opt-${index}`} className="flex items-center gap-2">
                        <div className="w-6 text-sm font-semibold text-muted-foreground">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <Input
                          value={opt}
                          onChange={(e) =>
                            updateActiveQuestion((draft) => {
                              const nextOptions = [...draft.optionTexts];
                              nextOptions[index] = e.target.value;
                              return { ...draft, optionTexts: nextOptions };
                            })
                          }
                          placeholder={`Şık ${String.fromCharCode(65 + index)} (opsiyonel)`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Doğru Cevap</label>
                    <Select
                      value={activeQuestion?.correctOption || ""}
                      onValueChange={(value) =>
                        updateActiveQuestion((draft) => ({ ...draft, correctOption: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Doğru şıkkı seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D", "E"].slice(0, activeQuestion?.optionCount || 5).map((letter, index) => {
                          const label = activeQuestion?.optionTexts?.[index]?.trim();
                          return (
                            <SelectItem key={`correct-${letter}`} value={letter}>
                              {letter}{label ? ` - ${label}` : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Puan</label>
                    <Input
                      type="number"
                      min={1}
                      value={activeQuestion?.points || ""}
                      onChange={(e) =>
                        updateActiveQuestion((draft) => ({ ...draft, points: e.target.value }))
                      }
                      placeholder="Örn: 10"
                    />
                  </div>
                </div>
              )}

              {postType === "VIDEO" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">YouTube URL</label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}

              {postType === "FILE" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dosya</label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      setFileMeta(null);
                    }}
                  />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                  {fileMeta && (
                    <Badge variant="outline" className="text-xs">
                      Dosya yüklendi
                    </Badge>
                  )}
                </div>
              )}

              {postType === "GOAL" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hedef Seç</label>
                  <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hedef seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {group.goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.targetData?.title || "Hedef"} {goal.isActive ? "" : "(Pasif)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {postType === "PLAN" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Çalışma Planı Seç</label>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Plan seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="goal-create" className="rounded-lg border">
                  <AccordionTrigger className="px-3 py-2 text-sm">
                    Mentörlük Hedefi / Görevi Ekle
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hedef Türü</label>
                        <Select
                          value={goalForm.goalType}
                          onValueChange={(value) =>
                            setGoalForm((prev) => ({
                              ...prev,
                              goalType: value,
                              isCompleted: value === "TASK" ? prev.isCompleted : false,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Hedef türü seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(GOAL_TYPE_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hedef Başlığı</label>
                        <Input
                          value={goalForm.title}
                          onChange={(e) => setGoalForm((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Hedef adını girin"
                        />
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Hedef Değer</label>
                          <Input
                            value={goalForm.targetValue}
                            onChange={(e) => setGoalForm((prev) => ({ ...prev, targetValue: e.target.value }))}
                            placeholder="Örn: 10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Birim</label>
                          <Input
                            value={goalForm.unit}
                            onChange={(e) => setGoalForm((prev) => ({ ...prev, unit: e.target.value }))}
                            placeholder="puan, saat, görev..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Açıklama</label>
                        <Textarea
                          value={goalForm.description}
                          onChange={(e) => setGoalForm((prev) => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Son Tarih</label>
                        <Input
                          type="date"
                          value={goalForm.deadline}
                          onChange={(e) => setGoalForm((prev) => ({ ...prev, deadline: e.target.value }))}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <label className="text-sm font-medium">Panoda Yayınla</label>
                          <p className="text-xs text-muted-foreground">Varsayılan olarak panoda yayınlanır</p>
                        </div>
                        <Switch
                          checked={goalForm.isPublished}
                          onCheckedChange={(checked) => setGoalForm((prev) => ({ ...prev, isPublished: checked }))}
                        />
                      </div>

                      {goalForm.goalType === "TASK" && (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <label className="text-sm font-medium">Görev Tamamlandı</label>
                            <p className="text-xs text-muted-foreground">Görev tamamlandı olarak işaretle</p>
                          </div>
                          <Switch
                            checked={goalForm.isCompleted}
                            onCheckedChange={(checked) => setGoalForm((prev) => ({ ...prev, isCompleted: checked }))}
                          />
                        </div>
                      )}

                      <Button type="button" onClick={handleCreateGoal} disabled={savingGoal}>
                        {savingGoal ? "Kaydediliyor..." : "Hedefi Kaydet"}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex gap-2">
                {postType === "FILE" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Yükleniyor
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Dosyayı Yükle
                      </>
                    )}
                  </Button>
                )}
                <Button type="button" onClick={handleCreatePost} disabled={posting || uploading}>
                  {posting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Paylaşılıyor
                    </>
                  ) : (
                    "Paylaş"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Henüz pano paylaşımı yapılmadı.
              </CardContent>
            </Card>
          ) : (
            sortedPosts.map((post) => {
              const surface = POST_SURFACES[post.type] ?? POST_SURFACES.ANNOUNCEMENT;
              return (
              <Card
                key={post.id}
                className={`shadow-sm ${POST_STYLES[post.type]?.card || ""} ${post.isPinned ? "ring-1 ring-amber-300" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${POST_STYLES[post.type]?.icon || "bg-slate-100"}`}>
                        {getPostIcon(post.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {post.title || (post.type === "QUESTION" ? "Soru Grubu" : "Paylaşım")}
                        </CardTitle>
                        <CardDescription>
                          {post.author.firstName} {post.author.lastName} • {formatDate(post.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {post.isPinned && (
                        <Badge variant="secondary" className="border-amber-200 bg-amber-100 text-amber-800">
                          Sabit
                        </Badge>
                      )}
                      <Badge variant="outline" className={POST_STYLES[post.type]?.badge}>
                        {POST_TYPE_LABELS[post.type] || post.type}
                      </Badge>
                      {canManage && (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePin(post)}
                            title={post.isPinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
                          >
                            <Pin className={`h-4 w-4 ${post.isPinned ? "text-amber-600" : "text-muted-foreground"}`} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingPost(post);
                              setEditTitle(post.title || post.data?.question || "");
                              setEditBody(post.body || "");
                            }}
                            title="Düzenle"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePost(post.id)}
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {post.body && <p className="text-sm text-muted-foreground whitespace-pre-line">{post.body}</p>}

                  {post.type === "FILE" && post.fileName && (
                    <div className="space-y-3">
                      {post.mimeType?.startsWith("image/") && (() => {
                        const fileImageKey = `file:${post.id}`;
                        const isFileExpanded = !!expandedFileImages[fileImageKey];
                        return (
                          <button
                            type="button"
                            onClick={() => toggleFileImage(fileImageKey)}
                            className={
                              isFileExpanded
                                ? "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                                : `overflow-hidden rounded-lg border ${surface.panel}`
                            }
                            aria-label={isFileExpanded ? "Görseli küçült" : "Görseli büyüt"}
                          >
                            <img
                              src={`${API_BASE_URL}/groups/${groupId}/board/${post.id}/file`}
                              alt={post.fileName}
                              className={`object-contain transition-all ${
                                isFileExpanded
                                  ? "max-h-[90vh] max-w-[90vw] cursor-zoom-out rounded-xl shadow-2xl"
                                  : "w-full max-h-[240px] sm:max-h-[320px] cursor-zoom-in"
                              }`}
                              loading="lazy"
                            />
                          </button>
                        );
                      })()}
                      <div className={`flex items-center justify-between rounded-lg border p-3 ${surface.panel}`}>
                        <div>
                          <div className="text-sm font-medium">{post.fileName}</div>
                          <div className="text-xs text-muted-foreground">
                            {post.fileSize ? `${Math.round(post.fileSize / 1024)} KB` : ""}
                          </div>
                        </div>
                        <a
                          href={`${API_BASE_URL}/groups/${groupId}/board/${post.id}/file`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          target="_blank"
                          rel="noreferrer"
                        >
                          İndir
                        </a>
                      </div>
                    </div>
                  )}

                  {post.type === "GOAL" && post.goal && (
                    <div className={`rounded-lg border p-3 ${surface.panel}`}>
                      <div className="font-medium">{post.goal.targetData?.title || "Hedef"}</div>
                      <div className="text-xs text-muted-foreground">
                        {post.goal.targetData?.targetValue || "-"} {post.goal.targetData?.unit || ""}
                      </div>
                    </div>
                  )}

                  {post.type === "PLAN" && post.plan && (
                    <div className={`rounded-lg border p-3 ${surface.panel}`}>
                      <div className="font-medium">{post.plan.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {post.plan.examType || "Plan"} {post.plan.gradeLevels?.length ? `• ${post.plan.gradeLevels.join(", ")}` : ""}
                      </div>
                      <Link href={`/dashboard/study-plans/${post.plan.id}`} className="text-sm text-indigo-600">
                        Planı Aç
                      </Link>
                    </div>
                  )}

                  {post.type === "VIDEO" && post.data?.url && (() => {
                    const videoKey = `video:${post.id}`;
                    const isVideoExpanded = !!expandedVideos[videoKey];
                    const videoSrc = getYoutubeEmbedUrl(post.data.url);
                    return (
                      <div className={`space-y-2 rounded-lg border p-3 ${surface.panel}`}>
                        <div className="text-sm font-medium">Video</div>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                          <iframe
                            src={videoSrc}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={post.title || "YouTube Video"}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="absolute right-2 top-2"
                            onClick={() => toggleVideoOverlay(videoKey)}
                          >
                            Büyüt
                          </Button>
                        </div>

                        {isVideoExpanded && (
                          <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                            onClick={() => toggleVideoOverlay(videoKey)}
                            role="button"
                            tabIndex={0}
                          >
                            <div
                              className="relative w-full max-w-4xl"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="absolute right-0 top-[-2.5rem]">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => toggleVideoOverlay(videoKey)}
                                >
                                  Kapat
                                </Button>
                              </div>
                              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
                                <iframe
                                  src={videoSrc}
                                  className="h-full w-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={post.title || "YouTube Video"}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {post.type === "POLL" && (
                    <div className={`rounded-lg border p-3 ${surface.panel}`}>
                      {canManage ? (
                        <Tabs defaultValue="poll" className="space-y-3">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="poll">Anket</TabsTrigger>
                            <TabsTrigger value="responses">
                              Yanıtlar ({post.responses?.length ?? 0})
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="poll" className="space-y-3">
                            <div className="font-medium">{post.data?.question || post.title || "Anket"}</div>
                            <div className="space-y-2">
                              {(post.data?.options || []).map((option: string) => {
                                const myResponse = post.responses?.[0];
                                const isSelected = myResponse?.selectedOption === option;
                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                                      isSelected ? surface.optionSelected : surface.option
                                    }`}
                                    disabled={!isStudent || !!myResponse}
                                    onClick={() => handleRespond(post.id, option)}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                            {post.responseStats ? (
                              <div className="space-y-2">
                                {Object.entries(post.responseStats.counts).map(([option, count]) => {
                                  const total = post.responseStats?.total || 1;
                                  const percentage = Math.round((count / total) * 100);
                                  return (
                                    <div key={option} className="space-y-1">
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{option}</span>
                                        <span>{count} (%{percentage})</span>
                                      </div>
                                      <div className={`h-2 rounded-full ${surface.track}`}>
                                        <div className={`h-2 rounded-full ${surface.fill}`} style={{ width: `${percentage}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">Anket sonuçları gizli.</div>
                            )}
                          </TabsContent>
                          <TabsContent value="responses">
                            {post.responses && post.responses.length > 0 ? (
                              <div className="space-y-2">
                                {post.responses.map((resp) => (
                                  <div key={resp.id} className="flex items-center justify-between text-xs">
                                    <span>
                                      {resp.student?.user.firstName} {resp.student?.user.lastName}
                                    </span>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{resp.selectedOption}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">Henüz yanıt yok.</div>
                            )}
                          </TabsContent>
                        </Tabs>
                      ) : (
                        <div className="space-y-3">
                          <div className="font-medium">{post.data?.question || post.title || "Anket"}</div>
                          <div className="space-y-2">
                            {(post.data?.options || []).map((option: string) => {
                              const myResponse = post.responses?.[0];
                              const isSelected = myResponse?.selectedOption === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                                    isSelected ? surface.optionSelected : surface.option
                                  }`}
                                  disabled={!isStudent || !!myResponse}
                                  onClick={() => handleRespond(post.id, option)}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                          {isStudent && post.responses?.[0] && (
                            <div className="text-xs text-muted-foreground">
                              Cevabınız: {post.responses?.[0]?.selectedOption}
                            </div>
                          )}
                          {post.responseStats ? (
                            <div className="space-y-2">
                              {Object.entries(post.responseStats.counts).map(([option, count]) => {
                                const total = post.responseStats?.total || 1;
                                const percentage = Math.round((count / total) * 100);
                                return (
                                  <div key={option} className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>{option}</span>
                                      <span>{count} (%{percentage})</span>
                                    </div>
                                    <div className={`h-2 rounded-full ${surface.track}`}>
                                      <div className={`h-2 rounded-full ${surface.fill}`} style={{ width: `${percentage}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">Anket sonuçları gizli.</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {post.type === "QUESTION" && (() => {
                    const surface = POST_SURFACES[post.type] ?? POST_SURFACES.ANNOUNCEMENT;
                    const questions = getQuestionItems(post);
                    if (questions.length === 0) {
                      return (
                        <div className={`rounded-lg border p-3 ${surface.panel}`}>
                          <div className="text-sm text-muted-foreground">Soru bulunamadı.</div>
                        </div>
                      );
                    }

                    const isQuestionGroup = Array.isArray(post.data?.questions);
                    const rawIndex = questionGroupIndex[post.id] ?? 0;
                    const activeIndex = Math.min(rawIndex, Math.max(questions.length - 1, 0));
                    const activeQuestion = questions[activeIndex];
                    const myResponse = isStudent ? post.responses?.[0] : null;
                    const myAnswers = isStudent ? parseAnswerPayload(myResponse?.selectedOption) : null;
                    const selectedOption = isStudent
                      ? isQuestionGroup
                        ? myAnswers?.[activeQuestion.id] || questionGroupDrafts[post.id]?.[activeQuestion.id]
                        : myResponse?.selectedOption
                      : undefined;
                    const isLocked = isStudent && !!myResponse;

                    const optionTexts = Array.isArray(activeQuestion.optionTexts) ? activeQuestion.optionTexts : [];
                    const options = Array.isArray(activeQuestion.options) ? activeQuestion.options : [];
                    const isLetterOptions = options.every((opt) => QUESTION_LETTERS.includes(opt));
                    const questionImageUrl = activeQuestion.filePath && activeQuestion.mimeType?.startsWith("image/")
                      ? isQuestionGroup
                        ? `${API_BASE_URL}/groups/${groupId}/board/${post.id}/file?questionId=${encodeURIComponent(activeQuestion.id)}`
                        : `${API_BASE_URL}/groups/${groupId}/board/${post.id}/file`
                      : null;
                    const questionImageKey = `${post.id}:${activeQuestion.id}`;
                    const isImageExpanded = !!expandedQuestionImages[questionImageKey];
                    const answeredCount = Object.keys(questionGroupDrafts[post.id] || {}).length;
                    const canSubmitGroup = answeredCount === questions.length;

                    const renderQuestionBody = () => (
                      <div className="space-y-3">
                        {post.title && (
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            {post.title}
                          </div>
                        )}
                        <div className="font-medium">{activeQuestion.question || "Soru"}</div>
                        {questionImageUrl && (
                          <button
                            type="button"
                            onClick={() => toggleQuestionImage(questionImageKey)}
                            className={
                              isImageExpanded
                                ? "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                                : `overflow-hidden rounded-lg border ${surface.panel}`
                            }
                            aria-label={isImageExpanded ? "Görseli küçült" : "Görseli büyüt"}
                          >
                            <img
                              src={questionImageUrl}
                              alt={activeQuestion.question || "Soru görseli"}
                              className={`object-contain transition-all ${
                                isImageExpanded
                                  ? "max-h-[90vh] max-w-[90vw] cursor-zoom-out rounded-xl shadow-2xl"
                                  : "w-full max-h-[320px] sm:max-h-[420px] lg:max-h-[520px] cursor-zoom-in"
                              }`}
                              loading="lazy"
                            />
                          </button>
                        )}
                        <div className="space-y-2">
                          {options.map((option, index) => {
                            const displayLetter = isLetterOptions ? option : (QUESTION_LETTERS[index] || option);
                            const displayText = isLetterOptions ? (optionTexts[index] || "") : option;
                            const isSelected = selectedOption === option;
                            const isDisabled = !isStudent || isLocked;
                            return (
                              <button
                                key={`${option}-${index}`}
                                type="button"
                                className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                                  isSelected ? surface.optionSelected : surface.option
                                }`}
                                disabled={isDisabled}
                                onClick={() => {
                                  if (!isStudent || isLocked) return;
                                  if (isQuestionGroup) {
                                    updateQuestionGroupAnswer(post.id, activeQuestion.id, option);
                                  } else {
                                    handleRespond(post.id, option);
                                  }
                                }}
                              >
                                {displayLetter}.{displayText ? ` ${displayText}` : ""}
                              </button>
                            );
                          })}
                        </div>
                        {isStudent && isQuestionGroup && !isLocked && (
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs text-muted-foreground">
                              Yanıtlanan: {answeredCount}/{questions.length}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSubmitQuestionGroup(post)}
                              disabled={!canSubmitGroup || submittingResponseId === post.id}
                            >
                              {submittingResponseId === post.id ? "Gönderiliyor..." : "Cevapları Gönder"}
                            </Button>
                          </div>
                        )}
                        {isStudent && isLocked && (
                          <div className="text-xs text-muted-foreground">
                            {isQuestionGroup ? (
                              <div className="space-y-1">
                                {questions.map((question, index) => {
                                  const answer = myAnswers?.[question.id];
                                  if (!answer) return null;
                                  const questionOptions = Array.isArray(question.options) ? question.options : [];
                                  const questionOptionTexts = Array.isArray(question.optionTexts) ? question.optionTexts : [];
                                  const isLetter = questionOptions.every((opt) => QUESTION_LETTERS.includes(opt));
                                  const idx = questionOptions.indexOf(answer);
                                  const letter = isLetter ? answer : (QUESTION_LETTERS[idx] || answer);
                                  const text = isLetter ? (questionOptionTexts[idx] || "") : answer;
                                  return (
                                    <div key={`${question.id}-answer`}>
                                      {index + 1}. soru: {letter}{text ? ` - ${text}` : ""}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div>Cevabınız: {selectedOption}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );

                    const renderQuestionNavigation = () => {
                      if (!isQuestionGroup) return null;
                      return (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-xs text-muted-foreground">
                            Soru {activeIndex + 1} / {questions.length}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setQuestionGroupIndex((prev) => ({
                                  ...prev,
                                  [post.id]: Math.max(0, activeIndex - 1),
                                }))
                              }
                              disabled={activeIndex === 0}
                            >
                              <ChevronLeft className="mr-1 h-4 w-4" />
                              Önceki
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setQuestionGroupIndex((prev) => ({
                                  ...prev,
                                  [post.id]: Math.min(questions.length - 1, activeIndex + 1),
                                }))
                              }
                              disabled={activeIndex >= questions.length - 1}
                            >
                              Sonraki
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    };

                    const renderResponses = () => {
                      if (!post.responses || post.responses.length === 0) {
                        return <div className="text-xs text-muted-foreground">Henüz yanıt yok.</div>;
                      }

                      return (
                        <div className="space-y-2">
                          {post.responses.map((resp) => {
                            const answerMap = parseAnswerPayload(resp.selectedOption);
                            return (
                              <div key={resp.id} className={`rounded-lg border p-2 text-xs ${surface.soft}`}>
                                <div className="flex items-center justify-between">
                                  <span>
                                    {resp.student?.user.firstName} {resp.student?.user.lastName}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {resp.pointsAwarded ? `${resp.pointsAwarded} puan` : ""}
                                  </span>
                                </div>
                                <div className="mt-2 space-y-1">
                                  {questions.map((question, index) => {
                                    const questionOptions = Array.isArray(question.options) ? question.options : [];
                                    const questionOptionTexts = Array.isArray(question.optionTexts) ? question.optionTexts : [];
                                    const isLetter = questionOptions.every((opt) => QUESTION_LETTERS.includes(opt));
                                    const selected = answerMap
                                      ? answerMap[question.id]
                                      : questions.length === 1
                                        ? resp.selectedOption
                                        : undefined;
                                    const idx = selected ? questionOptions.indexOf(selected) : -1;
                                    const letter = selected
                                      ? (isLetter ? selected : (QUESTION_LETTERS[idx] || selected))
                                      : "-";
                                    const text = selected && isLetter ? (questionOptionTexts[idx] || "") : selected || "";
                                    const isCorrect = question.correctOption ? selected === question.correctOption : null;
                                    return (
                                      <div key={`${resp.id}-${question.id}`} className={isCorrect === null ? "text-muted-foreground" : isCorrect ? "text-emerald-600" : "text-rose-600"}>
                                        {index + 1}. soru: {letter}{text ? ` - ${text}` : ""}
                                        {isCorrect === null ? "" : isCorrect ? " (Doğru)" : " (Yanlış)"}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    };

                    return (
                      <div className={`rounded-lg border p-3 ${surface.panel}`}>
                        {canManage ? (
                          <Tabs defaultValue="question" className="space-y-3">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="question">Soru</TabsTrigger>
                              <TabsTrigger value="responses">
                                Yanıtlar ({post.responses?.length ?? 0})
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="question" className="space-y-3">
                              {renderQuestionNavigation()}
                              {renderQuestionBody()}
                            </TabsContent>
                            <TabsContent value="responses">
                              {renderResponses()}
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <div className="space-y-3">
                            {renderQuestionNavigation()}
                            {renderQuestionBody()}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <Accordion type="single" collapsible className="w-full border-t pt-4">
                    <AccordionItem value={`replies-${post.id}`} className="border-none">
                      <AccordionTrigger className="text-sm font-medium">
                        Yanıtlar ({post.replies?.length ?? 0})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {post.replies && post.replies.length > 0 ? (
                            post.replies.map((reply) => (
                              <div key={reply.id} className={`rounded-lg border p-3 text-sm ${surface.soft}`}>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>
                                    {reply.author.firstName} {reply.author.lastName}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span>{formatDate(reply.createdAt)}</span>
                                    {canManage && (
                                      <>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingReplyId(reply.id);
                                            setEditingReplyBody(reply.body);
                                          }}
                                        >
                                          Düzenle
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteReply(post.id, reply.id)}
                                        >
                                          Sil
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {editingReplyId === reply.id ? (
                                  <div className="mt-2 space-y-2">
                                    <Textarea
                                      value={editingReplyBody}
                                      onChange={(e) => setEditingReplyBody(e.target.value)}
                                      rows={2}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateReply(post.id, reply.id)}
                                        disabled={savingReply || !editingReplyBody.trim()}
                                      >
                                        {savingReply ? "Kaydediliyor..." : "Kaydet"}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingReplyId(null);
                                          setEditingReplyBody("");
                                        }}
                                      >
                                        Vazgeç
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-2 text-slate-700 dark:text-slate-200">{reply.body}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">Henüz yanıt yok.</div>
                          )}
                        </div>

                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={replyDrafts[post.id] || ""}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            rows={2}
                            placeholder="Yanıt yaz..."
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(post.id)}
                            disabled={submittingReplyId === post.id || !(replyDrafts[post.id] || "").trim()}
                          >
                            {submittingReplyId === post.id ? "Gönderiliyor..." : "Yanıt Gönder"}
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
            })
          )}
        </div>
      </div>

      {stats && (
        <div className="grid gap-3 md:grid-cols-4">
          <Card className="border-dashed">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Toplam Üye</div>
              <div className="text-lg font-semibold">{stats.memberCount}</div>
              <div className="text-xs text-muted-foreground">Maks: {group.maxStudents ?? "-"}</div>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Aktif Hedefler</div>
              <div className="text-lg font-semibold">{publishedGoals.length}</div>
              <div className="text-xs text-muted-foreground">Toplam {stats.groupGoals ?? 0} hedef</div>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Toplam Çalışma</div>
              <div className="text-lg font-semibold">{stats.totalStudyHours ?? 0}</div>
              <div className="text-xs text-muted-foreground">Saat</div>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Üye Başına</div>
              <div className="text-lg font-semibold">{stats.avgStudyHoursPerMember ?? 0}</div>
              <div className="text-xs text-muted-foreground">Ortalama saat</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paylaşımı Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Başlık</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Açıklama</label>
              <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setEditingPost(null)}>
              Vazgeç
            </Button>
            <Button type="button" onClick={handleSavePostEdit} disabled={savingEdit}>
              {savingEdit ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
