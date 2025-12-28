/**
 * V.I.B.E. Assessment Component
 * Multi-step personality and cognitive assessment wizard
 */

import React, { useState, useEffect } from 'react';
import { ASSESSMENT_QUESTIONS, SECTION_INFO } from '../../lib/assessment/questions';
import { 
  calculateVIBEScore, 
  VIBEScore, 
  AssessmentResult, 
  AssessmentAnswer,
  getScoreColor,
  getScoreLabel,
  PERSONALITY_PROFILES,
  VIBE_TIERS,
  saveVIBEScore
} from '../../lib/assessment/vibeScore';

interface VIBEAssessmentProps {
  userId?: string;
  onComplete: (score: VIBEScore) => void;
  onSkip?: () => void;
}

type Section = 'intro' | 'verification' | 'intelligence' | 'behavioral' | 'evaluation' | 'results';

const VIBEAssessment: React.FC<VIBEAssessmentProps> = ({ userId = 'demo', onComplete, onSkip }) => {
  const [currentSection, setCurrentSection] = useState<Section>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [finalScore, setFinalScore] = useState<VIBEScore | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const sectionOrder: Section[] = ['verification', 'intelligence', 'behavioral', 'evaluation'];
  
  const getSectionQuestions = (section: Section) => 
    ASSESSMENT_QUESTIONS.filter(q => q.section === section);

  const currentQuestions = currentSection !== 'intro' && currentSection !== 'results' 
    ? getSectionQuestions(currentSection) 
    : [];

  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleAnswer = (value: number) => {
    if (!currentQuestion) return;
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    // Auto-advance after brief delay
    setIsAnimating(true);
    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Section complete - calculate section score
        completeSection();
      }
      setIsAnimating(false);
    }, 300);
  };

  const completeSection = () => {
    if (currentSection === 'intro' || currentSection === 'results') return;

    const sectionAnswers: AssessmentAnswer[] = currentQuestions.map(q => ({
      questionId: q.id,
      value: answers[q.id] || 0,
    }));

    // Calculate section score
    let score = 0;
    sectionAnswers.forEach((answer, index) => {
      const question = currentQuestions[index];
      if (question.type === 'cognitive') {
        score += answer.value === question.correctAnswer ? 100 : 0;
      } else {
        score += answer.value * 20; // 1-5 scale → 20-100
      }
    });
    score = Math.round(score / sectionAnswers.length);

    const sectionResult: AssessmentResult = {
      section: currentSection,
      score,
      answers: sectionAnswers,
      completedAt: new Date().toISOString(),
    };

    setResults(prev => [...prev, sectionResult]);

    // Move to next section
    const currentIndex = sectionOrder.indexOf(currentSection);
    if (currentIndex < sectionOrder.length - 1) {
      setCurrentSection(sectionOrder[currentIndex + 1]);
      setCurrentQuestionIndex(0);
    } else {
      // All sections complete - calculate final score
      const allResults = [...results, sectionResult];
      const score = calculateVIBEScore(allResults);
      setFinalScore(score);
      saveVIBEScore(userId, score);
      setCurrentSection('results');
    }
  };

  const startAssessment = () => {
    setCurrentSection('verification');
    setCurrentQuestionIndex(0);
  };

  const progress = currentSection === 'intro' ? 0 
    : currentSection === 'results' ? 100
    : ((sectionOrder.indexOf(currentSection) * 25) + ((currentQuestionIndex / currentQuestions.length) * 25));

  return (
    <div className="min-h-screen bg-carbon-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">V.I.B.E. Assessment</span>
            <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-carbon-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {sectionOrder.map((section, i) => (
              <div 
                key={section}
                className={`text-xs font-medium ${
                  sectionOrder.indexOf(currentSection) >= i ? 'text-green-400' : 'text-gray-600'
                }`}
              >
                {SECTION_INFO[section].icon} {SECTION_INFO[section].title.charAt(0)}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-carbon-800 rounded-2xl border border-carbon-700 overflow-hidden shadow-2xl">
          
          {/* INTRO */}
          {currentSection === 'intro' && (
            <div className="p-8 text-center">
              <div className="text-6xl mb-6">🎯</div>
              <h1 className="text-3xl font-black text-white mb-4">
                FDH <span className="text-green-400">V.I.B.E.</span> Assessment
              </h1>
              <p className="text-gray-400 mb-2">Verification • Intelligence • Behavioral • Evaluation</p>
              <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
                Complete this assessment to unlock your V.I.B.E. score and personality profile. 
                This helps clients find the perfect match for their projects.
              </p>
              
              <div className="grid grid-cols-4 gap-4 mb-8">
                {sectionOrder.map(section => (
                  <div key={section} className="bg-carbon-900 rounded-xl p-4 border border-carbon-700">
                    <div className="text-2xl mb-2">{SECTION_INFO[section].icon}</div>
                    <div className="text-xs text-gray-400">{SECTION_INFO[section].title}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={startAssessment}
                className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all text-lg"
              >
                Start Assessment →
              </button>
              
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="block mx-auto mt-4 text-gray-500 hover:text-white text-sm"
                >
                  Skip for now
                </button>
              )}
            </div>
          )}

          {/* QUESTIONS */}
          {currentSection !== 'intro' && currentSection !== 'results' && currentQuestion && (
            <div className={`p-8 transition-opacity ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center text-xl">
                  {SECTION_INFO[currentSection].icon}
                </div>
                <div>
                  <h2 className="text-white font-bold">{SECTION_INFO[currentSection].title}</h2>
                  <p className="text-gray-500 text-xs">{SECTION_INFO[currentSection].subtitle}</p>
                </div>
                <div className="ml-auto text-gray-500 text-sm">
                  {currentQuestionIndex + 1} / {currentQuestions.length}
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h3 className="text-xl text-white mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* Scale Type */}
                {currentQuestion.type === 'scale' && (
                  <div className="flex justify-between gap-3">
                    {[1, 2, 3, 4, 5].map(value => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(value)}
                        className={`flex-1 py-6 rounded-xl border-2 transition-all font-bold ${
                          answers[currentQuestion.id] === value
                            ? 'bg-green-500 border-green-400 text-black'
                            : 'bg-carbon-900 border-carbon-700 text-gray-400 hover:border-green-400 hover:text-white'
                        }`}
                      >
                        {value}
                        <div className="text-xs font-normal mt-1">
                          {value === 1 ? 'Disagree' : value === 5 ? 'Agree' : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Choice/Cognitive Type */}
                {(currentQuestion.type === 'choice' || currentQuestion.type === 'cognitive') && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          answers[currentQuestion.id] === index
                            ? 'bg-green-500 border-green-400 text-black'
                            : 'bg-carbon-900 border-carbon-700 text-gray-300 hover:border-green-400'
                        }`}
                      >
                        <span className="font-mono text-sm mr-3 opacity-50">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RESULTS */}
          {currentSection === 'results' && finalScore && (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Assessment Complete!</h2>
              <p className="text-gray-500 mb-8">Your V.I.B.E. profile is ready</p>

              {/* Score Display */}
              <div className="bg-carbon-900 rounded-2xl p-8 border border-carbon-700 mb-8">
                <div className="text-6xl font-black mb-2" style={{ color: getScoreColor(finalScore.total) }}>
                  {finalScore.total}
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm mb-4">
                  {getScoreLabel(finalScore.total)} • {VIBE_TIERS[finalScore.tier].label}
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {(['verification', 'intelligence', 'behavioral', 'evaluation'] as const).map(section => (
                    <div key={section} className="text-center">
                      <div className="text-2xl font-bold text-white">{finalScore[section]}</div>
                      <div className="text-xs text-gray-500">{section.charAt(0).toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personality Type */}
              <div className="bg-carbon-900 rounded-2xl p-6 border border-carbon-700 mb-8 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center text-xl font-bold">
                    {finalScore.personalityType}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{PERSONALITY_PROFILES[finalScore.personalityType].name}</h3>
                    <p className="text-gray-500 text-sm">{PERSONALITY_PROFILES[finalScore.personalityType].description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITY_PROFILES[finalScore.personalityType].strengths.map(strength => (
                    <span key={strength} className="px-3 py-1 bg-carbon-800 text-gray-400 rounded-full text-xs">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              {/* Badges */}
              {finalScore.badges.length > 0 && (
                <div className="flex justify-center gap-3 mb-8">
                  {finalScore.badges.map(badge => (
                    <div 
                      key={badge.id}
                      className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm"
                      title={badge.description}
                    >
                      {badge.icon} {badge.name}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => onComplete(finalScore)}
                className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all"
              >
                Continue to Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VIBEAssessment;
