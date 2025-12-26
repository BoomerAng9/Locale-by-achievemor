/**
 * Video Generator Component - Kie AI Integration
 * Professional UI for generating AI videos from text prompts
 */

import React, { useState, useEffect } from 'react';
import { generateVideo, checkVideoStatus, getAvailableStyles, VideoGenerationResponse } from '../../lib/video/kieai';

interface VideoJob {
  id: string;
  prompt: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  style: string;
  createdAt: Date;
}

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [activeJob, setActiveJob] = useState<string | null>(null);

  const styles = getAvailableStyles();

  // Poll for job status updates
  useEffect(() => {
    if (!activeJob) return;
    
    const interval = setInterval(async () => {
      const status = await checkVideoStatus(activeJob);
      
      setJobs(prev => prev.map(job => 
        job.id === activeJob 
          ? { ...job, status: status.status, videoUrl: status.videoUrl, thumbnailUrl: status.thumbnailUrl }
          : job
      ));

      if (status.status === 'completed' || status.status === 'failed') {
        setActiveJob(null);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeJob]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const response = await generateVideo({
        prompt: prompt.trim(),
        duration,
        aspectRatio,
        style: selectedStyle as any
      });

      const newJob: VideoJob = {
        id: response.id,
        prompt: prompt.trim(),
        status: response.status,
        style: selectedStyle,
        createdAt: new Date()
      };

      setJobs(prev => [newJob, ...prev]);
      setActiveJob(response.id);
      setPrompt('');
    } catch (error) {
      console.error('[VideoGenerator] Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold tracking-widest mb-4">
            <span>🎬</span> KIE AI VIDEO
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI Video Generator</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Transform your ideas into stunning videos using Kie AI's powerful generation capabilities.
          </p>
        </div>

        {/* Generator Form */}
        <div className="bg-carbon-800 rounded-2xl border border-carbon-700 p-8 mb-8">
          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Video Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to create... (e.g., 'A futuristic city at sunset with flying cars')"
              className="w-full bg-carbon-900 border border-carbon-600 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none h-32"
              disabled={isGenerating}
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Style Selector */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      selectedStyle === style.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-carbon-700 text-gray-400 hover:bg-carbon-600 hover:text-white'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Aspect Ratio</label>
              <div className="flex gap-2">
                {(['16:9', '9:16', '1:1'] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                      aspectRatio === ratio
                        ? 'bg-blue-500 text-white'
                        : 'bg-carbon-700 text-gray-400 hover:bg-carbon-600 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Duration: {duration}s</label>
              <input
                type="range"
                min="3"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-carbon-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3s</span>
                <span>30s</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              isGenerating
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <span>🎬</span>
                Generate Video
              </>
            )}
          </button>
        </div>

        {/* Jobs List */}
        {jobs.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-xl mb-4">Your Videos</h2>
            <div className="space-y-4">
              {jobs.map(job => (
                <div 
                  key={job.id}
                  className="bg-carbon-800 rounded-xl border border-carbon-700 p-6 flex items-center gap-6"
                >
                  {/* Thumbnail / Status */}
                  <div className="w-32 h-20 rounded-lg bg-carbon-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {job.status === 'processing' ? (
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-gray-400 mt-2">Processing...</span>
                      </div>
                    ) : job.status === 'completed' && job.thumbnailUrl ? (
                      <img src={job.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : job.status === 'failed' ? (
                      <span className="text-red-500 text-2xl">❌</span>
                    ) : (
                      <span className="text-4xl opacity-30">🎬</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{job.prompt}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="capitalize">{job.style}</span>
                      <span>•</span>
                      <span>{job.createdAt.toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className={`font-medium ${
                        job.status === 'completed' ? 'text-green-400' :
                        job.status === 'processing' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {job.status === 'completed' && job.videoUrl && (
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm">
                        Play
                      </button>
                      <button className="px-4 py-2 bg-carbon-700 text-gray-300 rounded-lg font-medium hover:bg-carbon-600 transition-colors text-sm">
                        Download
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
