import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, CornerDownLeft, Sparkles, RefreshCw } from "lucide-react";
import { Message } from "../types";

const SUGGESTIONS = [
  "What is the foundation design of Mollik Tower?",
  "Tell me about the glass curtain wall facade.",
  "What are the standby generator capabilities?",
  "How are solar panels & sky gardens configured on the roof?",
  "Is the superstructure designed for seismic zone wind loads?"
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am the Mollik Tower AI Engineering Consultant. I have access to full structural blueprints, material specs, HVAC details, and environmental reports. Ask me anything about the building design, engineering criteria, or construction details.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI server");
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: data.reply || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: "I encountered a communication gap with the server. Please verify your `GEMINI_API_KEY` is configured in Settings. Here is a baseline specification answer: The superstructure of Mollik Tower consists of a core shear wall and flat plate slabs with C40/50 grade high-strength concrete.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: "Hello! I am the Mollik Tower AI Engineering Consultant. I have access to full structural blueprints, material specs, HVAC details, and environmental reports. Ask me anything about the building design, engineering criteria, or construction details.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Simple and highly robust text parser to render basic markdown-like elements safely
  const formatText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Render headers
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-cyan-300 mt-3 mb-1">
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-base font-bold text-cyan-200 mt-4 mb-2">
            {trimmed.replace("##", "").trim()}
          </h3>
        );
      }

      // Render bullet points
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li key={idx} className="text-slate-300 ml-4 list-disc text-xs leading-relaxed mb-1">
            {parseBold(trimmed.substring(1).trim())}
          </li>
        );
      }

      // Default paragraph with bold parsing
      return (
        <p key={idx} className="text-slate-300 text-xs leading-relaxed mb-2">
          {parseBold(trimmed)}
        </p>
      );
    });
  };

  // Parse **bold** markers inside strings
  const parseBold = (str: string) => {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-cyan-400 font-semibold">{part}</strong> : part));
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
      {/* Assistant Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/40 border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-cyan-950/60 rounded-lg border border-cyan-800/30">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">AI Architectural Advisor</h3>
            <p className="text-[9px] text-slate-500 font-mono">ENGINEERING COPILOT · ONLINE</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          title="Reset Conversation"
          className="p-1.5 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((m) => (
          <div key={m.id} className={`flex space-x-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            {m.sender === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}
            <div className="max-w-[85%] flex flex-col space-y-1">
              <div
                className={`px-3.5 py-2.5 rounded-xl text-xs shadow-md border ${
                  m.sender === "user"
                    ? "bg-cyan-600/10 border-cyan-500/30 text-cyan-100 rounded-tr-none"
                    : "bg-slate-950/40 border-slate-800/80 text-slate-200 rounded-tl-none"
                }`}
              >
                {m.sender === "assistant" ? formatText(m.text) : <p className="leading-relaxed">{m.text}</p>}
              </div>
              <span className={`text-[9px] font-mono text-slate-500 ${m.sender === "user" ? "text-right mr-1" : "ml-1"}`}>
                {m.timestamp}
              </span>
            </div>
            {m.sender === "user" && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex space-x-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="bg-slate-950/40 border border-slate-800/80 px-4 py-3 rounded-xl rounded-tl-none flex items-center space-x-1.5 shadow-md">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-slate-800/40 bg-slate-950/20">
          <div className="flex items-center space-x-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Suggested Queries</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="text-[10px] text-slate-300 hover:text-cyan-300 bg-slate-850 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/30 rounded-full px-2.5 py-1 transition-all text-left truncate max-w-full cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-slate-950/40 border-t border-slate-800/60 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about materials, dimensions, calculations..."
          disabled={loading}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
