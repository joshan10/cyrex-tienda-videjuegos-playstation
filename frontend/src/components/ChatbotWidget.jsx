import { useState } from 'react';
import { chatbotAPI } from '../services/api';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hola. Puedo orientarte sobre productos, compras y PQR.' }]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || sending) return;
    setMessage('');
    setMessages((current) => [...current, { role: 'user', content }]);
    setSending(true);
    try {
      const response = await chatbotAPI.send(content, conversationId);
      setConversationId(response.conversacion_id);
      setMessages((current) => [...current, { role: 'assistant', content: response.respuesta }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: 'No pude responder ahora. Intenta nuevamente en unos segundos.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-5 z-50">
      {open && <div className="mb-3 flex h-[min(32rem,calc(100vh-10rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-2xl"><div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3"><div><p className="font-display text-sm text-[var(--color-text)]">Asistente Cyrex</p><p className="text-xs text-[var(--color-muted)]">Atención inicial</p></div><button type="button" aria-label="Cerrar chatbot" onClick={() => setOpen(false)} className="text-lg text-[var(--color-muted)] hover:text-[var(--color-text)]">×</button></div><div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((item, index) => <div key={`${item.role}-${index}`} className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${item.role === 'user' ? 'ml-auto bg-[var(--color-accent)] text-[var(--color-bg)]' : 'bg-[var(--color-bg)] text-[var(--color-text)]'}`}>{item.content}</div>)}{sending && <p className="text-xs text-[var(--color-muted)]">Escribiendo...</p>}</div><form onSubmit={sendMessage} className="flex gap-2 border-t border-[var(--color-line)] p-3"><input aria-label="Mensaje para el chatbot" className="min-w-0 flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" value={message} onChange={(e) => setMessage(e.target.value.slice(0, 2000))} placeholder="Escribe tu consulta" maxLength={2000} /><button type="submit" aria-label="Enviar mensaje" className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-[var(--color-bg)] disabled:opacity-50" disabled={sending || !message.trim()}>Enviar</button></form></div>}
      <button type="button" aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'} onClick={() => setOpen(!open)} className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-surface)] text-xl text-[var(--color-accent)] shadow-xl transition-transform hover:scale-105">{open ? '×' : '✦'}</button>
    </div>
  );
}