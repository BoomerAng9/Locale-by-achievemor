/**
 * Manus AI Integration
 * "Power Local Up": Agentic Project Management & Task Execution
 */

const MANUS_API_KEY = (import.meta as any).env.VITE_MANUS_API_KEY;
const BASE_URL = 'https://api.manus.ai/v1';

export interface ManusProject {
    id: string;
    name: string;
    instruction: string;
    created_at: number;
}

export interface ManusTask {
    id: string;
    title: string;
    status: 'queued' | 'running' | 'completed' | 'paused';
    progress_message?: string;
}

// 1. List Projects
export const listManusProjects = async (): Promise<ManusProject[]> => {
    if (!MANUS_API_KEY) return [];
    try {
        const res = await fetch(`${BASE_URL}/projects?limit=10`, {
            method: 'GET',
            headers: { 'API_KEY': MANUS_API_KEY }
        });
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error("Manus API Error:", e);
        return [];
    }
};

// 2. Create Project
export const createManusProject = async (name: string, instruction: string): Promise<ManusProject | null> => {
    if (!MANUS_API_KEY) return null;
    try {
        const res = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            headers: { 
                'API_KEY': MANUS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, instruction })
        });
        return await res.json();
    } catch (e) {
        console.error("Manus Create Error:", e);
        return null;
    }
};
