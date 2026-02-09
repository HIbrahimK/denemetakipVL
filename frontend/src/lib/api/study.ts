const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Study Plans
export const studyPlansApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/study/plans`, {
    });
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/study/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  assign: async (planId: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/study/plans/${planId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Study Tasks
export const studyTasksApi = {
  getMy: async () => {
    const response = await fetch(`${API_BASE_URL}/study/tasks/my`, {
    });
    return response.json();
  },

  complete: async (taskId: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/study/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  verify: async (taskId: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/study/tasks/${taskId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Study Sessions
export const studySessionsApi = {
  log: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/study/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getStats: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/study/sessions/stats?${queryString}`, {
    });
    return response.json();
  },
};

// Goals
export const goalsApi = {
  getMy: async () => {
    const response = await fetch(`${API_BASE_URL}/goals/my`, {
    });
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateProgress: async (goalId: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Achievements
export const achievementsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/goals/achievements/all`, {
    });
    return response.json();
  },

  getMy: async () => {
    const response = await fetch(`${API_BASE_URL}/goals/achievements/my`, {
    });
    return response.json();
  },

  getProgress: async (studentId?: number) => {
    const url = studentId
      ? `${API_BASE_URL}/goals/achievements/progress/${studentId}`
      : `${API_BASE_URL}/goals/achievements/progress`;
    const response = await fetch(url, {
    });
    return response.json();
  },
};

// Groups
export const groupsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
    });
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  addMember: async (groupId: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getStats: async (groupId: number) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/stats`, {
    });
    return response.json();
  },
};

// Recommendations
export const recommendationsApi = {
  getForStudent: async (studentId: number) => {
    const response = await fetch(`${API_BASE_URL}/study/recommendations/student/${studentId}`, {
    });
    return response.json();
  },

  generateForStudent: async (studentId: number) => {
    const response = await fetch(`${API_BASE_URL}/study/recommendations/generate/${studentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};
