import { useState, useRef, useEffect } from "react";
import { apiClient } from "../lib/api-client-backend";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MessageCircle, Send, X, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function HRChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour! Je suis votre assistant RH. Posez-moi des questions sur vos candidats, employés ou politiques RH." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await apiClient.request<{answer: string}>("/employees/chatbot", { method: "POST", body: JSON.stringify({ question }) });
      setMessages(prev => [...prev, { role: "assistant", content: res.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion au chatbot." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        style={{position:"fixed", bottom:"24px", right:"24px", zIndex:9999, background:"#9333ea", color:"white", borderRadius:"9999px", padding:"16px", display:"flex", alignItems:"center", gap:"8px", boxShadow:"0 10px 25px rgba(0,0,0,0.3)", border:"none", cursor:"pointer"}}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-sm font-medium">Assistant Invocia</span>
      </button>

      {/* Chat window */}
      {open && (
        <div style={{position:"fixed", bottom:"100px", right:"24px", zIndex:99999, width:"384px", boxShadow:"0 25px 50px rgba(0,0,0,0.4)", borderRadius:"16px", overflow:"hidden", border:"1px solid #e5e7eb"}}>
          {/* Header */}
          <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Assistant Invocia</span>
              <span className="text-xs bg-purple-500 px-2 py-0.5 rounded-full">IA</span>
            </div>
            <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          {/* Messages */}
          <div className="bg-white h-96 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-purple-100" : "bg-gray-100"}`}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4 text-purple-600" /> : <User className="w-4 h-4 text-gray-600" />}
                </div>
                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${msg.role === "assistant" ? "bg-gray-100 text-gray-800" : "bg-purple-600 text-white"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Posez votre question..."
              className="flex-1 text-sm"
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()} size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
