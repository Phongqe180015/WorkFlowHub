import type { Subtask } from '../types';
import { SubtaskApiService } from './api';

export const SubtaskService = {
  STORAGE_PREFIX: 'workflowhub_subtasks_',

  getLocalSubtasks(taskId: number): Subtask[] {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${taskId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLocalSubtasks(taskId: number, subtasks: Subtask[]): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${taskId}`, JSON.stringify(subtasks));
    } catch (e) {
      console.warn('Failed to save subtasks to localStorage:', e);
    }
  },

  async fetchSubtasks(taskId: number): Promise<Subtask[]> {
    try {
      const remote = await SubtaskApiService.getSubtasksByTaskId(taskId);
      if (remote && remote.length > 0) {
        const formatted: Subtask[] = remote.map((r: any) => ({
          id: r.id,
          taskId: r.taskId || taskId,
          title: r.title,
          description: r.description,
          isCompleted: Boolean(r.isCompleted),
          createdAt: r.createdAt,
        }));
        this.saveLocalSubtasks(taskId, formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('Failed to fetch remote subtasks, fallback to local:', err);
    }
    return this.getLocalSubtasks(taskId);
  },

  async addSubtask(taskId: number, title: string): Promise<Subtask> {
    try {
      const remote = await SubtaskApiService.createSubtask({ taskId, title });
      if (remote && remote.id) {
        const newSt: Subtask = {
          id: remote.id,
          taskId,
          title: remote.title || title,
          isCompleted: Boolean(remote.isCompleted),
          createdAt: remote.createdAt,
        };
        const current = this.getLocalSubtasks(taskId);
        this.saveLocalSubtasks(taskId, [...current, newSt]);
        return newSt;
      }
    } catch (err) {
      console.warn('API addSubtask failed, saving locally:', err);
    }

    const current = this.getLocalSubtasks(taskId);
    const newSubtask: Subtask = {
      id: Date.now(),
      taskId,
      title: title.trim(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...current, newSubtask];
    this.saveLocalSubtasks(taskId, updated);
    return newSubtask;
  },

  async toggleSubtask(taskId: number, subtaskId: number | string): Promise<Subtask[]> {
    const current = this.getLocalSubtasks(taskId);
    const target = current.find((s) => s.id === subtaskId);
    const nextCompleted = target ? !target.isCompleted : true;

    try {
      await SubtaskApiService.updateSubtask(subtaskId, { isCompleted: nextCompleted });
    } catch (err) {
      console.warn('API updateSubtask failed, updating locally:', err);
    }

    const updated = current.map((st) =>
      st.id === subtaskId ? { ...st, isCompleted: nextCompleted } : st
    );
    this.saveLocalSubtasks(taskId, updated);
    return updated;
  },

  async deleteSubtask(taskId: number, subtaskId: number | string): Promise<Subtask[]> {
    try {
      await SubtaskApiService.deleteSubtask(subtaskId);
    } catch (err) {
      console.warn('API deleteSubtask failed, removing locally:', err);
    }

    const current = this.getLocalSubtasks(taskId);
    const updated = current.filter((st) => st.id !== subtaskId);
    this.saveLocalSubtasks(taskId, updated);
    return updated;
  },
};
