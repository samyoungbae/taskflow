// Arquivo Corrigido e Completo: app/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AuthButtons } from "@/components/AuthButtons";
import { Trash2, Circle, CheckCircle, Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
}

export default function HomePage() {
  const { data: session, status } = useSession();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  // --- UMA ÚNICA E CORRETA FUNÇÃO fetchTasks ---
  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error("Falha ao buscar tarefas");
        setTasks([]); // Limpa as tarefas em caso de erro
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setIsLoadingInitial(false); // Finaliza o loading inicial da página
    }
  };
  
  // useEffect para buscar as tarefas quando o usuário está autenticado
  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks();
    } else if (status === "unauthenticated") {
      setIsLoadingInitial(false); // Se não está logado, não precisa carregar
    }
  }, [status]);

  // --- FUNÇÕES DE AÇÃO CORRIGIDAS ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask }),
      });
      if (response.ok) {
        setNewTask("");
        await fetchTasks(); // Await para garantir que a lista atualize
      }
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    setLoadingTaskId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !task.isCompleted }),
      });
      if (response.ok) {
        await fetchTasks(); // Await para garantir que a lista atualize
      }
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    } finally {
      setLoadingTaskId(null);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta tarefa?")) return;

    setLoadingTaskId(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchTasks(); // Await para garantir que a lista atualize
      }
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    } finally {
      setLoadingTaskId(null);
    }
  };

  // --- RENDERIZAÇÃO ---
  
  if (status === "loading" || isLoadingInitial) {
    return (
      <main className="flex items-center justify-center bg-slate-900 min-h-screen">
        <Loader2 className="animate-spin text-white" size={48} />
      </main>
    );
  }

  return (
    <main className="bg-slate-900 text-white min-h-screen">
      <div className="max-w-xl mx-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">TaskFlow</h1>
          <AuthButtons />
        </header>

        {status === "authenticated" ? (
          <>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="O que precisa ser feito?"
                className="flex-grow p-2 rounded bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 w-28 p-2 px-4 rounded font-bold flex items-center justify-center disabled:bg-blue-800 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Adicionar'}
              </button>
            </form>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className={`bg-slate-800 p-4 rounded flex justify-between items-center transition-opacity ${loadingTaskId === task.id ? "opacity-50" : "opacity-100"}`}>
                  <span
                    className={`cursor-pointer ${task.isCompleted ? "line-through text-slate-500" : ""}`}
                    onClick={() => loadingTaskId !== task.id && handleToggleComplete(task)}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-3 w-16 justify-end">
                    {loadingTaskId === task.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <button onClick={() => handleToggleComplete(task)} className="text-slate-400 hover:text-green-400">
                          {task.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center bg-slate-800 p-10 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Bem-vindo ao TaskFlow!</h2>
            <p className="text-slate-400">Por favor, faça o login com sua conta do GitHub para gerenciar suas tarefas.</p>
          </div>
        )}
      </div>
    </main>
  );
}