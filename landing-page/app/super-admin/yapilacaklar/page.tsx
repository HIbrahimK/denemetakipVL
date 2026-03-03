"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Calendar,
  Flag,
  Clock,
} from "lucide-react";

type Priority = "low" | "medium" | "high";
type TodoStatus = "pending" | "completed";

interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TodoStatus;
  dueDate?: string;
  createdAt: string;
}

const initialTodos: Todo[] = [
  {
    id: "1",
    title: "Yeni okul kurulumu tamamla",
    description: "Ankara Atatürk Lisesi kurulumunu tamamla ve bilgilendirme maili gönder.",
    priority: "high",
    status: "pending",
    dueDate: "2024-03-16",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    title: "Ticket #1245'i yanıtla",
    description: "Giriş yapma sorununu çöz ve kullanıcıya dön.",
    priority: "high",
    status: "completed",
    dueDate: "2024-03-15",
    createdAt: "2024-03-15",
  },
  {
    id: "3",
    title: "Lisans yenilemelerini kontrol et",
    description: "Bitiş tarihi yaklaşan okulları listele ve hatırlatma gönder.",
    priority: "medium",
    status: "pending",
    dueDate: "2024-03-20",
    createdAt: "2024-03-14",
  },
  {
    id: "4",
    title: "Yeni blog yazısı hazırla",
    description: "Excel import rehberi yazısını güncelle.",
    priority: "low",
    status: "pending",
    createdAt: "2024-03-13",
  },
  {
    id: "5",
    title: "Sistem yedeklemesini kontrol et",
    description: "Haftalık yedekleme raporunu incele.",
    priority: "medium",
    status: "completed",
    dueDate: "2024-03-14",
    createdAt: "2024-03-13",
  },
];

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const addTodo = () => {
    if (!newTodoTitle.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: newTodoTitle,
      priority: "medium",
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTodos([newTodo, ...todos]);
    setNewTodoTitle("");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, status: todo.status === "pending" ? "completed" : "pending" }
          : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    return todo.status === filter;
  });

  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const completedCount = todos.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Yapılacaklar</h1>
        <p className="text-muted-foreground">
          Görevlerinizi takip edin ve yönetin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Toplam</p>
            <p className="text-2xl font-bold">{todos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bekleyen</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tamamlanan</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Todo */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Yeni görev ekle..."
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              className="flex-1"
            />
            <Button onClick={addTodo}>
              <Plus className="h-4 w-4 mr-2" />
              Ekle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Tümü
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Bekleyen
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Tamamlanan
        </Button>
      </div>

      {/* Todo List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Görevler</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredTodos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Henüz görev yok</p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="mt-1"
                  >
                    {todo.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        todo.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {todo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                          todo.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : todo.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        <Flag className="h-3 w-3" />
                        {todo.priority === "high"
                          ? "Yüksek"
                          : todo.priority === "medium"
                          ? "Orta"
                          : "Düşük"}
                      </span>
                      {todo.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {todo.dueDate}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {todo.createdAt}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
