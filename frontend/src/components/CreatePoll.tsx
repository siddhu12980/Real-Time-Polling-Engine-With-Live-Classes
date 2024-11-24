import React, { useState } from 'react';
import { PenLine, Timer, Plus, Minus, CheckCircle2, X } from "lucide-react";

const PollType = {
  FIVE_OPTION: "5_option",
  FOUR_OPTION: "4_option",
  THREE_OPTION: "3_option",
  TRUE_FALSE: "true_false"
};

const CreatePoll = ({ onClose, onSubmit }:any) => {
  const [pollType, setPollType] = useState(PollType.FOUR_OPTION);
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [timer, setTimer] = useState(15);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [question, setQuestion] = useState('');

  const handleTimerChange = (increment: number) => {
    setTimer(prev => {
      const newValue = prev + increment;
      return newValue >= 5 && newValue <= 60 ? newValue : prev;
    });
  };

  const getOptionsForType = (type: string) => {
    switch (type) {
      case PollType.FIVE_OPTION:
        return ['A', 'B', 'C', 'D', 'E'];
      case PollType.FOUR_OPTION:
        return ['A', 'B', 'C', 'D'];
      case PollType.THREE_OPTION:
        return ['A', 'B', 'C'];
      case PollType.TRUE_FALSE:
        return ['True', 'False'];
      default:
        return ['A', 'B', 'C', 'D'];
    }
  };

  const handleSubmit = () => {
    onSubmit({
      type: pollType,
      correctAnswer,
      timer,
      question: question.trim() || null
    });
  };

  return (
    <div className="w-full min-h-screen sm:min-h-0 sm:max-w-md mx-auto bg-white sm:rounded-lg shadow-lg">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        <div className="space-y-2">
          <button
            className="w-full px-3 sm:px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-colors"
            onClick={() => setShowQuestionInput(!showQuestionInput)}
          >
            <PenLine className="mr-2 h-4 w-4" />
            {showQuestionInput ? 'Hide Question Input' : 'Add Question'}
          </button>

          {showQuestionInput && (
            <textarea
              className="w-full p-2.5 text-base sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question here..."
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Poll Type</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.entries(PollType).map(([key, value]) => (
              <button
                key={key}
                className={`px-2 sm:px-3 py-2.5 text-sm font-medium rounded-md w-full transition-colors
                  ${pollType === value
                    ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                onClick={() => setPollType(value)}
              >
                <span className="block truncate">
                  {value.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Correct Answer</label>
          <div className="flex flex-wrap gap-2">
            {getOptionsForType(pollType).map((option) => (
              <button
                key={option}
                className={`flex-1 min-w-[4rem] px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                  ${correctAnswer === option
                    ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                onClick={() => setCorrectAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Timer (seconds)</label>
          <div className="flex items-center justify-center gap-4">
            <button
              className="p-2.5 rounded-md border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              onClick={() => handleTimerChange(-5)}
            >
              <Minus className="h-5 w-5" color='black' />
            </button>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" color='black' />
              <span className="text-lg font-medium text-black min-w-[2rem] text-center">{timer}</span>
            </div>
            <button
              className="p-2.5 rounded-md border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              onClick={() => handleTimerChange(5)}
            >
              <Plus  color='black' className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button 
            className="w-full px-4 py-3 text-base sm:text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-colors"
            onClick={handleSubmit}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Start Poll
          </button>
          <button 
            className="w-full px-4 py-3 text-base sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <X className="mr-2 h-5 w-5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;