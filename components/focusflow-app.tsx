"use client";

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BarChart3, CheckCircle2, Clock3, LayoutDashboard, Menu, MoonStar, PlusCircle, Settings2, SunMedium, Target, TimerReset, Trash2, WifiOff } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from 'next-themes';
import { usePomodoro } from '@/hooks/use-pomodoro';
import { useFocusFlow } from '@/hooks/use-focusflow';
import { APP_NAME } from '@/lib/env';
import type { TaskFilter, TaskItem, TaskPriority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type TaskFormState = {
  title: string;
  notes: string;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
};

const emptyForm: TaskFormState = {
  title: '',
  notes: '',
  priority: 'medium',
  dueDate: new Date().toISOString().slice(0, 10),
  completed: false
};

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function priorityStyles(priority: TaskPriority) {
  switch (priority) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    default:
      return 'success';
  }
}

function TaskEditor({
  currentTask,
  onSave,
  onCancel
}: {
  currentTask: TaskItem | null;
  onSave: (value: TaskFormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TaskFormState>(currentTask ?? emptyForm);

  useEffect(() => {
    setForm(currentTask ?? emptyForm);
  }, [currentTask]);

  return (
    <Card className="animate-fadeUp">
      <CardHeader>
        <CardTitle>{currentTask ? 'Editar tarea' : 'Nueva tarea'}</CardTitle>
        <CardDescription>Crea tareas con prioridad y fecha límite.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Diseñar dashboard" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Detalle breve de la tarea" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <select id="priority" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))} className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha límite</Label>
            <Input id="dueDate" type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
          </div>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm">
          <input type="checkbox" checked={form.completed} onChange={(event) => setForm((current) => ({ ...current, completed: event.target.checked }))} />
          Marcar como completada
        </label>
      </CardContent>
      <div className="flex gap-3 px-6 pb-6">
        <Button onClick={() => onSave(form)} className="flex-1">{currentTask ? 'Guardar cambios' : 'Crear tarea'}</Button>
        {currentTask ? <Button variant="outline" onClick={onCancel}>Cancelar</Button> : null}
      </div>
    </Card>
  );
}

function MetricCard({ icon, title, value, description }: { icon: ReactNode; title: string; value: string; description: string }) {
  return (
    <Card className="animate-fadeUp">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-3 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}

export function FocusFlowApp() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { tasks, settings, stats, filteredTasks, addTask, updateTask, deleteTask, toggleTask, addSession, updateTheme, updatePomodoroMinutes, updateDailyGoalMinutes, resetAll } = useFocusFlow();

  const currentTask = editingTaskId ? tasks.find((task) => task.id === editingTaskId) ?? null : null;

  const pomodoro = usePomodoro(settings.pomodoroMinutes, (completedMinutes) => {
    addSession(completedMinutes);
  });

  const visibleTasks = filteredTasks(taskFilter);

  const saveTask = (value: TaskFormState) => {
    const payload = {
      title: value.title.trim() || 'Tarea sin título',
      notes: value.notes.trim(),
      priority: value.priority,
      dueDate: value.dueDate,
      completed: value.completed
    };

    if (currentTask) {
      updateTask(currentTask.id, payload);
      setEditingTaskId(null);
      return;
    }

    addTask(payload);
  };

  const toggleTheme = () => {
    const currentTheme = resolvedTheme ?? theme ?? settings.theme;
    const nextTheme: 'dark' | 'light' = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    updateTheme(nextTheme);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      <div className="absolute inset-0 -z-10 bg-grid-fade opacity-100" />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setSidebarCollapsed((current) => !current)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{APP_NAME}</p>
              <h1 className="text-xl font-semibold tracking-tight">Productividad con foco real</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">{settings.pomodoroMinutes} min Pomodoro</Badge>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {(resolvedTheme ?? theme ?? settings.theme) === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className={cn('space-y-6 transition-all duration-300', sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]')}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center')}>
                <LayoutDashboard className="h-4 w-4" />
                {!sidebarCollapsed ? 'Navegación' : null}
              </CardTitle>
              {!sidebarCollapsed ? <CardDescription>Acceso rápido a las secciones principales.</CardDescription> : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: <Target className="h-4 w-4" />, label: 'Dashboard' },
                { icon: <PlusCircle className="h-4 w-4" />, label: 'Tareas' },
                { icon: <Clock3 className="h-4 w-4" />, label: 'Pomodoro' },
                { icon: <BarChart3 className="h-4 w-4" />, label: 'Estadísticas' },
                { icon: <Settings2 className="h-4 w-4" />, label: 'Configuración' }
              ].map((item) => (
                <div key={item.label} className={cn('flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 text-sm', sidebarCollapsed && 'justify-center px-3')}>
                  {item.icon}
                  {!sidebarCollapsed ? item.label : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center')}>
                <WifiOff className="h-4 w-4" />
                {!sidebarCollapsed ? 'Persistencia local' : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!sidebarCollapsed ? <p className="text-sm text-muted-foreground">Todo se guarda en localStorage. No hay backend ni APIs externas.</p> : null}
              <Button variant="outline" className="w-full" onClick={resetAll}>
                <Trash2 className="h-4 w-4" />
                {!sidebarCollapsed ? 'Resetear datos' : null}
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={<Target className="h-5 w-5" />} title="Tareas" value={`${stats.totalTasks}`} description={`${stats.pendingTasks} pendientes y ${stats.completedTasks} completadas`} />
            <MetricCard icon={<Clock3 className="h-5 w-5" />} title="Focus de hoy" value={`${stats.todaysFocusMinutes} min`} description="Tiempo enfocado acumulado hoy" />
            <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} title="Completadas" value={`${stats.completedTasks}`} description="Tareas finalizadas en total" />
            <MetricCard icon={<TimerReset className="h-5 w-5" />} title="Progreso diario" value={`${stats.dailyProgress}%`} description="Según el objetivo configurado" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Resumen semanal</CardTitle>
                <CardDescription>Productividad y sesiones enfocadas de los últimos 7 días.</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="name" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 16 }} />
                    <Bar dataKey="minutes" radius={[16, 16, 0, 0]} fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datos rápidos</CardTitle>
                <CardDescription>Indicadores clave de rendimiento personal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm text-muted-foreground">Sesiones totales</p>
                  <p className="mt-1 text-2xl font-semibold">{stats.totalSessions}</p>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm text-muted-foreground">Horas enfocadas</p>
                  <p className="mt-1 text-2xl font-semibold">{stats.focusHours} h</p>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm text-muted-foreground">Productividad diaria</p>
                  <p className="mt-1 text-2xl font-semibold">{stats.todayTasks} tareas hoy</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <TaskEditor currentTask={currentTask} onSave={saveTask} onCancel={() => setEditingTaskId(null)} />

            <Card className="animate-fadeUp">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Sistema de tareas</CardTitle>
                    <CardDescription>Gestiona tareas, fechas límite y prioridad.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'pending', 'completed'] as TaskFilter[]).map((filter) => (
                      <Button key={filter} variant={taskFilter === filter ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter(filter)}>
                        {filter === 'all' ? 'Todas' : filter === 'pending' ? 'Pendientes' : 'Completadas'}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {visibleTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">No hay tareas para este filtro.</div>
                ) : (
                  visibleTasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-border/60 bg-background/60 p-4 transition-transform hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className={cn('font-semibold', task.completed && 'text-muted-foreground line-through')}>{task.title}</h3>
                            <Badge variant={priorityStyles(task.priority)}>{task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}</Badge>
                            {task.completed ? <Badge variant="success">Hecha</Badge> : null}
                          </div>
                          <p className="text-sm text-muted-foreground">{task.notes || 'Sin notas'}</p>
                          <p className="text-xs text-muted-foreground">Límite: {task.dueDate || 'Sin fecha'}</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button variant="outline" size="sm" onClick={() => toggleTask(task.id)}>
                            {task.completed ? 'Desmarcar' : 'Completar'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingTaskId(task.id)}>
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <Card className="animate-fadeUp">
              <CardHeader>
                <CardTitle>Temporizador Pomodoro</CardTitle>
                <CardDescription>Sesión actual de enfoque con sonido al terminar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full border border-border/60 bg-gradient-to-br from-primary/10 to-accent/10 shadow-soft">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{pomodoro.status === 'running' ? 'En curso' : pomodoro.status === 'paused' ? 'Pausado' : 'Listo'}</p>
                    <p className="mt-4 text-6xl font-semibold tracking-tight">{formatClock(pomodoro.remainingSeconds)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={pomodoro.start}>Iniciar</Button>
                  <Button variant="outline" onClick={pomodoro.pause}>Pausar</Button>
                  <Button variant="outline" onClick={pomodoro.reset}>Reiniciar</Button>
                </div>
                <p className="text-sm text-muted-foreground">Cada sesión completada se registra automáticamente en tus estadísticas.</p>
              </CardContent>
            </Card>

            <Card className="animate-fadeUp">
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>Ajusta el tema, la duración y tu objetivo diario.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Modo visual</Label>
                  <div className="flex gap-3">
                    <Button variant={settings.theme === 'dark' ? 'default' : 'outline'} onClick={() => { setTheme('dark'); updateTheme('dark'); }}>
                      <MoonStar className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button variant={settings.theme === 'light' ? 'default' : 'outline'} onClick={() => { setTheme('light'); updateTheme('light'); }}>
                      <SunMedium className="h-4 w-4" />
                      Light
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pomodoroMinutes">Duración Pomodoro</Label>
                    <Input id="pomodoroMinutes" type="number" min={5} max={90} value={settings.pomodoroMinutes} onChange={(event) => updatePomodoroMinutes(Number(event.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyGoalMinutes">Objetivo diario</Label>
                    <Input id="dailyGoalMinutes" type="number" min={15} max={600} value={settings.dailyGoalMinutes} onChange={(event) => updateDailyGoalMinutes(Number(event.target.value))} />
                  </div>
                </div>
                <Separator />
                <Button variant="destructive" className="w-full" onClick={resetAll}>
                  <Trash2 className="h-4 w-4" />
                  Resetear todo
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
