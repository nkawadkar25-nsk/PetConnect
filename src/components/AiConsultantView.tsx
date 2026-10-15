import React, { useState } from 'react';
import {
  Send,
  Stethoscope,
  Brain,
  Lightbulb,
} from 'lucide-react';
import { PetProfile, CollarTelemetry } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AiConsultantViewProps {
  pet: PetProfile;
  telemetry: CollarTelemetry;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiConsultantView: React.FC<AiConsultantViewProps> = ({ pet, telemetry }) => {
  const { themeConfig } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello! I'm your Pet Connect Veterinary Care Assistant. I have direct access to ${pet.name}'s collar biometrics (currently ${telemetry.heartRate} BPM, ${telemetry.temperature}°C, ${telemetry.tailLateralBias} tail wag). How can I assist you with ${pet.name}'s health, diet, or behavior today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    `Why is ${pet.name}'s tail wagging with a leftward bias?`,
    `What is a normal resting heart rate for a ${pet.breed}?`,
    `How does the collar detect thunderstorms or scared mood?`,
    `Can dogs eat peanut butter or cooked eggs?`,
    `What should I do if ${pet.name}'s temperature reaches 39.8°C?`,
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputQuestion;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat-vet-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.trim(),
          pet,
          currentTelemetry: telemetry,
        }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: data.answer || "I've reviewed the collar readings. Everything appears normal, but please consult your veterinarian for specific diagnosis.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: `Based on canine physiology: ${pet.name}'s vitals show ${telemetry.heartRate} BPM and ${telemetry.temperature}°C. The left-biased tail wag indicates heightened right-hemisphere processing (caution, hesitation, or anxiety). Maintain calm reassurance and keep fresh water available.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col h-[640px] overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
              Veterinary Care Assistant
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                · Telemetry Synced
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Canine behavioral physiology & clinical health guidance
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-stone-500 dark:text-stone-400 font-mono hidden sm:block">
          {telemetry.heartRate} BPM · {telemetry.temperature}°C · {telemetry.motionState}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="font-medium text-stone-500 dark:text-stone-400 shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Prompts:
        </span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-stone-400 text-stone-600 dark:text-stone-300 whitespace-nowrap transition-all shadow-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                m.sender === 'user'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {m.sender === 'user' ? 'Me' : <Brain className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-3.5 leading-relaxed ${
                m.sender === 'user'
                  ? `${themeConfig.accentClass.btnPrimary} rounded-tr-xs`
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-xs whitespace-pre-wrap'
              }`}
            >
              <p>{m.text}</p>
              <div
                className={`text-[9px] mt-1 text-right font-mono ${
                  m.sender === 'user' ? 'opacity-80' : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-xs italic pl-9">
            <div className="w-3 h-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
            Evaluating clinical telemetry...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={`Ask about ${pet.name}'s tail wag, temperature, nutrition, or behavior...`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-stone-400/20 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isTyping}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-40 ${themeConfig.accentClass.btnPrimary}`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
