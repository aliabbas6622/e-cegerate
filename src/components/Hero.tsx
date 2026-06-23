import React from 'react';
import { Sparkles, ArrowRight, Play, RefreshCw } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExploreClick }) => {
  const [modelLoading, setModelLoading] = React.useState(true);
  const [modelError, setModelError] = React.useState(false);

  // Re-enable model loading on settings change
  React.useEffect(() => {
    setModelLoading(true);
    setModelError(false);
  }, [settings.heroModelUrl, settings.heroModelActive]);

  return (
    <section className="relative w-full min-h-[calc(100vh-4rem)] flex items-center bg-radial from-gray-50/50 via-white to-white py-12 md:py-20 overflow-hidden">
      {/* Dynamic Aesthetic Background Glow */}
      <div className="absolute top-1/4 right-0 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ 
          background: `radial-gradient(circle, ${settings.accentColor || '#3b82f6'} 0%, transparent 70%)` 
        }}
      />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-700 bg-teal-200/40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6 z-10">
            {/* Tag / Announcement Pill */}
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-gray-50 border border-gray-100/80 text-gray-700 select-none"
              id="hero-tag-pill"
            >
              <Sparkles 
                className="w-3.5 h-3.5" 
                style={{ color: settings.accentColor || '#3b82f6' }}
              />
              Introducing Premium Line
            </div>

            {/* Title / Headline */}
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 tracking-tight leading-[1.1] animate-fade-in"
              id="hero-title"
            >
              {settings.heroTitle}
            </h1>

            {/* Subtitle */}
            <p 
              className="text-base sm:text-lg text-gray-500 max-w-lg leading-relaxed font-sans"
              id="hero-subtitle"
            >
              {settings.heroSubtitle}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              {/* Primary Exploration Button */}
              <button
                onClick={onExploreClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide text-white transition-all shadow-md hover:shadow-lg cursor-pointer transform active:scale-95 duration-200"
                style={{ 
                  backgroundColor: settings.accentColor || '#3b82f6'
                }}
                id="hero-cta-primary"
              >
                {settings.heroCtaText}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary Button */}
              <button
                onClick={onExploreClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium tracking-wide text-gray-700 bg-white border border-gray-200/80 hover:bg-gray-50 transition-all cursor-pointer transform active:scale-95 duration-200"
                id="hero-cta-secondary"
              >
                View Catalog
              </button>
            </div>

            {/* Core Values / Small Metadata bar */}
            <div className="flex items-center gap-6 pt-6 border-t border-gray-100 w-full sm:w-auto">
              <div>
                <p className="text-xl font-bold text-gray-900 font-display">100%</p>
                <p className="text-xs text-gray-400 font-medium">Premium Materials</p>
              </div>
              <div className="h-8 w-px bg-gray-100" />
              <div>
                <p className="text-xl font-bold text-gray-900 font-display">2 Year</p>
                <p className="text-xs text-gray-400 font-medium">Full Warranty</p>
              </div>
              <div className="h-8 w-px bg-gray-100" />
              <div>
                <p className="text-xl font-bold text-gray-900 font-display">Free</p>
                <p className="text-xs text-gray-400 font-medium">Global Express Delivery</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Model / Fallback Image container */}
          <div className="lg:col-span-6 flex justify-center items-center relative min-h-[350px] sm:min-h-[450px] lg:min-h-[500px]">
            {/* Background sculptural circle */}
            <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-gray-50 border border-gray-100/50 -z-10 animate-pulse duration-[8000ms]" />

            {settings.heroModelActive && settings.heroModelUrl && !modelError ? (
              <div className="w-full h-full absolute inset-0 flex items-center justify-center">
                {/* 3D Model Viewer Wrapper */}
                <model-viewer
                  src={settings.heroModelUrl}
                  poster={settings.heroImage}
                  alt="Aesthetic 3D Product Model"
                  auto-rotate
                  camera-controls
                  touch-action="pan-y"
                  shadow-intensity="1"
                  shadow-softness="0.5"
                  exposure="1.1"
                  interaction-prompt="none"
                  style={{ width: '100%', height: '100%', minHeight: '350px' }}
                  loading="eager"
                  id="hero-3d-model"
                  onError={() => {
                    console.error("Failed to load 3D model, showing static image");
                    setModelError(true);
                  }}
                  onLoad={() => {
                    setModelLoading(false);
                  }}
                />

                {/* Model Interactive overlay prompt */}
                {modelLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xs pointer-events-none">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                    <span className="text-xs text-gray-400 mt-2 font-medium">Initializing 3D Canvas...</span>
                  </div>
                )}
                {!modelLoading && (
                  <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-400 flex items-center gap-1 border border-gray-100 pointer-events-none uppercase tracking-wider">
                    <Play className="w-3 h-3 text-gray-400 fill-current" /> Hold & Rotate 3D Object
                  </div>
                )}
              </div>
            ) : (
              // Static Fallback Image
              <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100/60 bg-white">
                <img 
                  src={settings.heroImage} 
                  alt="Featured Product" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  id="hero-fallback-image"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
