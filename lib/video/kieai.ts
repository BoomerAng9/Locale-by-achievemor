/**
 * Kie AI Video Generation Integration
 * API for generating videos from prompts
 */

const KIE_AI_API_KEY = (import.meta as any).env?.VITE_KIE_AI_API_KEY;
const KIE_AI_BASE_URL = 'https://api.kie.ai/v1';

export interface VideoGenerationRequest {
    prompt: string;
    duration?: number; // seconds
    aspectRatio?: '16:9' | '9:16' | '1:1';
    style?: 'cinematic' | 'animated' | 'realistic' | 'abstract';
}

export interface VideoGenerationResponse {
    id: string;
    status: 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    createdAt: string;
    estimatedWaitTime?: number;
}

/**
 * Generate a video from a text prompt
 */
export const generateVideo = async (request: VideoGenerationRequest): Promise<VideoGenerationResponse> => {
    if (!KIE_AI_API_KEY) {
        console.warn('[Kie AI] No API key configured, using mock response');
        return mockVideoResponse(request);
    }

    try {
        const response = await fetch(`${KIE_AI_BASE_URL}/video/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${KIE_AI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: request.prompt,
                duration: request.duration || 5,
                aspect_ratio: request.aspectRatio || '16:9',
                style: request.style || 'cinematic'
            })
        });

        if (!response.ok) {
            throw new Error(`Kie AI API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Kie AI] Generation failed:', error);
        return mockVideoResponse(request);
    }
};

/**
 * Check the status of a video generation job
 */
export const checkVideoStatus = async (jobId: string): Promise<VideoGenerationResponse> => {
    if (!KIE_AI_API_KEY) {
        return {
            id: jobId,
            status: 'completed',
            videoUrl: 'https://example.com/mock-video.mp4',
            thumbnailUrl: 'https://example.com/mock-thumbnail.jpg',
            duration: 5,
            createdAt: new Date().toISOString()
        };
    }

    try {
        const response = await fetch(`${KIE_AI_BASE_URL}/video/status/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${KIE_AI_API_KEY}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Status check failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Kie AI] Status check failed:', error);
        return {
            id: jobId,
            status: 'failed',
            createdAt: new Date().toISOString()
        };
    }
};

/**
 * List available styles
 */
export const getAvailableStyles = (): { id: string; name: string; description: string }[] => {
    return [
        { id: 'cinematic', name: 'Cinematic', description: 'Professional film-quality visuals' },
        { id: 'animated', name: 'Animated', description: '2D/3D animation style' },
        { id: 'realistic', name: 'Realistic', description: 'Photo-realistic rendering' },
        { id: 'abstract', name: 'Abstract', description: 'Artistic and abstract visuals' },
    ];
};

/**
 * Mock response for development
 */
function mockVideoResponse(request: VideoGenerationRequest): VideoGenerationResponse {
    return {
        id: `mock-${Date.now()}`,
        status: 'processing',
        estimatedWaitTime: 30,
        createdAt: new Date().toISOString()
    };
}

export default {
    generateVideo,
    checkVideoStatus,
    getAvailableStyles
};
