import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
}

interface AssessmentPanelProps {
  questions: Question[];
}

export default function AssessmentPanel({ questions }: AssessmentPanelProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  const score = calculateScore();

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white my-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Lab Assessment</h2>
        {submitted && (
          <div className="text-xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            Score: {score} / {questions.length}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-5 border rounded-lg bg-gray-50 border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">
              {idx + 1}. {q.text}
            </h3>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[q.id] === optIdx;
                const isCorrect = q.correctAnswer === optIdx;
                const showCorrect = submitted && isCorrect;
                const showWrong = submitted && isSelected && !isCorrect;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(q.id, optIdx)}
                    disabled={submitted}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                      isSelected && !submitted ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
                    } ${showCorrect ? 'border-green-500 bg-green-50' : ''} ${showWrong ? 'border-red-500 bg-red-50' : ''}`}
                  >
                    <span>{opt}</span>
                    {showCorrect && <CheckCircle2 className="text-green-500" size={20} />}
                    {showWrong && <XCircle className="text-red-500" size={20} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end gap-4">
        {submitted ? (
          <button
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw size={18} /> Retake Quiz
          </button>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < questions.length}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answers
          </button>
        )}
      </div>
    </div>
  );
}
