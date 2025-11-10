import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  from: "user" | "bot";
  text: string;
  timestamp: Date;
}

// Función para generar un UUID simple (identificador único)
// Esto asegura que cada usuario tenga una conversación única.
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // 1. Estado para almacenar el Session ID (se crea al cargar la app)
  const [sessionId, setSessionId] = useState(() => generateUUID());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      from: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. JSON que se envía: Incluye 'pregunta' y 'sessionid'
      const payload = {
        pregunta  : input, // Cambiamos 'message' por 'pregunta' (ver sección 2)
        sessionid: sessionId,
      };

      const res = await fetch(
        "https://jhoyer.app.n8n.cloud/webhook/agente-edificio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      console.log("Respuesta del res:", res);

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      // El Webhook de n8n ahora devuelve un JSON como: { "respuesta": "..." }
      const data = await res.json();

      console.log("Datos recibidos del servidor data:", data);
      const botMessage: Message = {
        from: "bot",
        // Aquí ajustamos para leer el campo "output" que n8n debe enviar
        text:
          data[0].output ||
          data.response[0].output ||
          "Lo siento, no pude procesar tu solicitud.",
        timestamp: new Date(),
      };

      console.log("Respuesta del bot botMessage:", botMessage);

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        from: "bot",
        text: "Lo siento, hubo un error al conectar con el servidor. Por favor, intenta nuevamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Asistente Virtual
            </h1>
            <p className="text-sm text-slate-500">Conectado con N8N</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-slate-600 mb-2">
                ¡Hola! ¿En qué puedo ayudarte?
              </h2>
              <p className="text-slate-400">
                Escribe tu consulta para comenzar
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.from === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.from === "user" ? "bg-blue-500" : "bg-slate-300"
                }`}
              >
                {msg.from === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-slate-600" />
                )}
              </div>

              <div
                className={`max-w-xl px-4 py-3 rounded-2xl shadow-sm ${
                  msg.from === "user"
                    ? "bg-blue-500 text-white rounded-tr-sm"
                    : "bg-white text-slate-800 rounded-tl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                <span
                  className={`text-xs mt-1 block ${
                    msg.from === "user" ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-slate-600" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu consulta..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
