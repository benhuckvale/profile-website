import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const API = import.meta.env.VITE_TWIN_API_URL as string;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Tier = 'public' | 'premium';

// ── Claim form ────────────────────────────────────────────────────────────────

function ClaimForm({ token, onClaimed }: { token: string; onClaimed: () => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/access/claim`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Something went wrong');
      }
      onClaimed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
      <div>
        <h2 className="text-xl font-semibold mb-2">You've been invited</h2>
        <p className="text-sm text-gray-400">
          Enter your email to access the full interview experience.
          Your conversation will be saved so you can continue later.
        </p>
      </div>
      <form onSubmit={submit} aria-label="Claim premium access" className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="email"
          required
          aria-label="Email address"
          aria-describedby={error ? 'claim-error' : undefined}
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-primary-accent"
        />
        {error && <p id="claim-error" role="alert" className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary-accent text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Confirming…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-primary-accent text-white rounded-br-sm'
            : 'bg-gray-800 text-gray-100 rounded-bl-sm'
        }`}
      >
        <span className="sr-only">{isUser ? 'You: ' : 'Ben: '}</span>
        {msg.content}
      </div>
    </div>
  );
}

// ── Main chat ─────────────────────────────────────────────────────────────────

export default function DigitalTwin() {
  const searchParams = new URLSearchParams(window.location.search);
  const accessToken = searchParams.get('access');

  const [tier, setTier] = useState<Tier | null>(null);
  const [needsClaim, setNeedsClaim] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [humanVerified, setHumanVerified] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Resolve tier on mount
  useEffect(() => {
    if (accessToken) {
      // Check if token is valid and whether it needs claiming
      fetch(`${API}/access?token=${accessToken}`, { credentials: 'include' })
        .then(r => r.json() as Promise<{ claimed?: boolean; tier?: string; error?: string }>)
        .then(data => {
          if (data.error) { setTier('public'); return; }
          if (!data.claimed) { setNeedsClaim(true); return; }
          // Already claimed — session cookie should be set, check /me
          checkMe();
        })
        .catch(() => setTier('public'));
    } else {
      checkMe();
    }
  }, []);

  function checkMe() {
    fetch(`${API}/me`, { credentials: 'include' })
      .then(r => r.json() as Promise<{ tier: Tier }>)
      .then(data => setTier(data.tier))
      .catch(() => setTier('public'));
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      // Include Turnstile token on first public message, then mark verified
      const isFirstPublicMessage = tier === 'public' && !humanVerified;
      const body = tier === 'premium'
        ? JSON.stringify({ message: text })
        : JSON.stringify({
            messages: nextMessages,
            ...(isFirstPublicMessage && turnstileToken ? { turnstileToken } : {}),
          });

      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      // Add placeholder assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;
          const parsed = JSON.parse(payload) as { text?: string; error?: string };
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) {
            assistantText += parsed.text;
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: assistantText },
            ]);
          }
        }
      }
      if (isFirstPublicMessage) setHumanVerified(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  // ── Render states ───────────────────────────────────────────────────────────

  if (needsClaim && accessToken) {
    return (
      <div className="h-[600px] bg-gray-900 rounded-2xl border border-gray-700">
        <ClaimForm token={accessToken} onClaimed={checkMe} />
      </div>
    );
  }

  if (tier === null) {
    return (
      <div
        role="status"
        aria-label="Loading chat"
        className="h-[600px] bg-gray-900 rounded-2xl border border-gray-700 flex items-center justify-center"
      >
        <span className="text-gray-500 text-sm" aria-hidden="true">Loading…</span>
      </div>
    );
  }

  const placeholder = tier === 'premium'
    ? 'Ask me anything about my background…'
    : 'Ask me about my experience, skills, or projects…';

  const intro: Message = {
    role: 'assistant',
    content: tier === 'premium'
      ? "Hi — Ben's invited you to have a proper conversation. Ask me anything about his background, experience, or what he's looking for."
      : "Hi, I'm a digital twin of Ben Huckvale. Ask me about his experience, skills, or projects. For a richer conversation, where you can ask for deeper narrative of my experience, as part of a confidential conversation, ask Ben for a personal link.",
  };

  return (
    <div
      role="region"
      aria-label="Chat with Ben's digital twin"
      className="flex flex-col h-[600px] bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
        <div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-200">Ben Huckvale · Digital Twin</span>
        {tier === 'premium' && (
          <span className="ml-auto text-xs text-primary-accent" aria-label="Premium access">Premium</span>
        )}
      </div>

      {/* Messages */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
      >
        <Bubble msg={intro} />
        {messages.map((m, i) => <Bubble key={i} msg={m} />)}
        {loading && (
          <div className="flex justify-start">
            <span className="sr-only">Ben's digital twin is generating a response</span>
            <div aria-hidden="true" className="bg-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Turnstile — public tier only, until first message verified */}
      {tier === 'public' && !humanVerified && (
        <div className="flex justify-center px-4 py-2 border-t border-gray-700">
          <Turnstile
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={setTurnstileToken}
            options={{ theme: 'dark', size: 'normal' }}
          />
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={send}
        aria-label="Send a message"
        className="flex gap-2 px-4 py-3 border-t border-gray-700"
      >
        <input
          type="text"
          aria-label="Message"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          aria-disabled={loading}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || (tier === 'public' && !humanVerified && !turnstileToken)}
          aria-label="Send message"
          className="px-4 py-2 rounded-xl bg-primary-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          Send
        </button>
      </form>
    </div>
  );
}
