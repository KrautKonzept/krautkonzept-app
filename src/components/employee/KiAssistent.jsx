import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2, AlertTriangle } from "lucide-react";

export default function KiAssistent() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hallo! Ich bin dein KI-Assistent von KrautKonzept. Ich helfe dir bei allen Fragen rund um Cannabis Social Clubs, Compliance, Gründung und Strategie. Wie kann ich dir helfen?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Only send user/assistant messages to API (exclude initial greeting which is from us)
    const apiMessages = newMessages.filter(m => m.role === "user" || (m.role === "assistant" && newMessages.indexOf(m) > 0));

    let response;
    try {
      response = await base44.functions.invoke("kiAssistent", {
        messages: apiMessages.map(m => ({ role: m.role, content: m.content }))
      });
    } catch (e) {
      setLoading(false);
      setApiError(true);
      return;
    }

    setLoading(false);
    if (response.data?.content) {
      setApiError(false);
      setMessages(prev => [...prev, { role: "assistant", content: response.data.content }]);
    } else {
      setApiError(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">KI-Assistent</h2>
        <p className="text-sm text-gray-500">Dein Berater für alle CSC-Fragen</p>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          KI nicht konfiguriert – bitte <strong className="mx-1">ANTHROPIC_API_KEY</strong> in den Secrets eintragen.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-orange-600" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-800"
            }`}>
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-orange-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nachricht eingeben... (Enter zum Senden)"
          rows={2}
          className="resize-none flex-1"
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="bg-orange-500 hover:bg-orange-600 text-white h-10 px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}