/* =====================================================================
 * Bristlehome Concierge Widget
 * -------------------------------------------------------------------
 * Drop-in chat UI that talks to the Supabase /concierge edge function.
 * Self-contained — injects its own CSS, HTML, and event handlers.
 * No framework dependencies. No build step.
 *
 * Install:
 *   Add this before </body> in index.html:
 *     <script src="/concierge.js" defer></script>
 *
 * Configure via data- attributes on the script tag (optional):
 *   <script src="/concierge.js"
 *           data-endpoint="https://uazjhfrybuxuxelcajkk.supabase.co/functions/v1/concierge_v6"
 *           data-title="Concierge"
 *           data-open="true"
 *           defer></script>
 * ===================================================================== */
 
(function () {
  "use strict";
 
  // ---------------------------------------------------------------
  // Config (read from script tag data-attrs, with defaults)
  // ---------------------------------------------------------------
  const script = document.currentScript || (function () {
    const scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();
 
  const CONFIG = {
    endpoint: script.dataset.endpoint || "https://uazjhfrybuxuxelcajkk.supabase.co/functions/v1/concierge_v6",
    title: script.dataset.title || "Concierge",
    openOnLoad: script.dataset.open === "true",
    storageKey: "bristlehome_concierge_v1",
    sessionTTLHours: 24,
  };
 
  // ---------------------------------------------------------------
  // Styles (scoped with .bh-c- prefix to avoid collisions)
  // ---------------------------------------------------------------
  const CSS = `
  #bh-c-root, #bh-c-root *, #bh-c-root *::before, #bh-c-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
 
  #bh-c-root {
    --bh-ink: #0A0A0A;
    --bh-graphite: #1F1F1F;
    --bh-mute: #6B6B6B;
    --bh-line: #E5E5E5;
    --bh-line-strong: #D4D4D4;
    --bh-bg: #FAFAFA;
    --bh-panel: #FFFFFF;
    --bh-accent: #1F3A2E;
    --bh-signal: #C46A36;
    --bh-user-bubble: #0A0A0A;
    --bh-user-text: #FFFFFF;
 
    font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
    font-feature-settings: "ss01", "cv11";
    position: fixed;
    z-index: 2147483000;
    bottom: 24px;
    right: 24px;
  }
 
  /* ============ TRIGGER PILL ============ */
  .bh-c-trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px 12px 14px;
    background: var(--bh-ink);
    border: 1px solid var(--bh-ink);
    border-radius: 999px;
    color: #FFFFFF;
    font-family: 'Geist', sans-serif;
    font-size: 0.84rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(10,10,10,0.18), 0 1px 4px rgba(10,10,10,0.12);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .bh-c-trigger:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(10,10,10,0.24), 0 2px 6px rgba(10,10,10,0.14);
  }
  .bh-c-trigger-mark {
    width: 22px; height: 22px;
    background: var(--bh-ink);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 5px;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .bh-c-trigger-mark::before {
    content: '';
    position: absolute;
    top: 5px; left: 5px; right: 5px; bottom: 5px;
    background: repeating-linear-gradient(to right, var(--bh-signal) 0 1px, transparent 1px 3px);
  }
  .bh-c-trigger-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #22C55E;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.20);
    margin-left: 2px;
  }
 
  /* ============ PANEL ============ */
  .bh-c-panel {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 400px;
    max-width: calc(100vw - 48px);
    height: 620px;
    max-height: calc(100vh - 48px);
    background: var(--bh-panel);
    border: 1px solid var(--bh-line);
    border-radius: 16px;
    box-shadow: 0 32px 80px -12px rgba(10,10,10,0.28), 0 8px 24px -4px rgba(10,10,10,0.12);
    display: none;
    flex-direction: column;
    overflow: hidden;
    transform-origin: bottom right;
    opacity: 0;
    transform: translateY(12px) scale(0.98);
    transition: opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .bh-c-panel.bh-c-open {
    display: flex;
    opacity: 1;
    transform: translateY(0) scale(1);
  }
 
  /* ============ HEADER ============ */
  .bh-c-header {
    padding: 18px 20px 16px;
    border-bottom: 1px solid var(--bh-line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bh-panel);
    flex-shrink: 0;
  }
  .bh-c-header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .bh-c-header-mark {
    width: 28px; height: 28px;
    background: var(--bh-ink);
    border-radius: 6px;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .bh-c-header-mark::before {
    content: '';
    position: absolute;
    top: 7px; left: 7px; right: 7px; bottom: 7px;
    background: repeating-linear-gradient(to right, var(--bh-signal) 0 1px, transparent 1px 3px);
  }
  .bh-c-header-title {
    font-family: 'Geist', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--bh-ink);
    line-height: 1;
  }
  .bh-c-header-subtitle {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 0.8rem;
    color: var(--bh-signal);
    line-height: 1;
    margin-top: 2px;
  }
  .bh-c-header-status {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Geist Mono', 'SF Mono', monospace;
    font-size: 0.62rem;
    color: var(--bh-mute);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .bh-c-header-status::before {
    content: '';
    width: 5px; height: 5px; border-radius: 50%;
    background: #22C55E;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.18);
  }
  .bh-c-close {
    width: 28px; height: 28px;
    display: grid; place-items: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--bh-mute);
    cursor: pointer;
    transition: background 0.15s;
    font-size: 16px;
    line-height: 1;
  }
  .bh-c-close:hover { background: var(--bh-bg); color: var(--bh-ink); }
 
  /* ============ MESSAGES ============ */
  .bh-c-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
    background: var(--bh-panel);
    background-image:
      radial-gradient(circle at 1px 1px, rgba(10,10,10,0.015) 1px, transparent 0);
    background-size: 16px 16px;
  }
  .bh-c-messages::-webkit-scrollbar { width: 6px; }
  .bh-c-messages::-webkit-scrollbar-track { background: transparent; }
  .bh-c-messages::-webkit-scrollbar-thumb {
    background: var(--bh-line-strong);
    border-radius: 3px;
  }
 
  .bh-c-msg {
    display: flex;
    flex-direction: column;
    max-width: 85%;
    animation: bhCFadeIn 0.32s ease-out;
  }
  @keyframes bhCFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
 
  .bh-c-msg-role {
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    color: var(--bh-mute);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-bottom: 6px;
  }
  .bh-c-msg-bubble {
    padding: 12px 15px;
    border-radius: 10px;
    font-size: 0.92rem;
    line-height: 1.55;
    color: var(--bh-graphite);
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  /* Assistant messages */
  .bh-c-msg-assistant {
    align-self: flex-start;
  }
  .bh-c-msg-assistant .bh-c-msg-bubble {
    background: var(--bh-bg);
    border: 1px solid var(--bh-line);
    border-top-left-radius: 2px;
  }
  /* First assistant message gets italic display font on first line */
  .bh-c-msg-assistant.bh-c-msg-first .bh-c-msg-bubble::first-line {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 1.05rem;
    color: var(--bh-accent);
  }
  /* User messages */
  .bh-c-msg-user {
    align-self: flex-end;
  }
  .bh-c-msg-user .bh-c-msg-role { text-align: right; }
  .bh-c-msg-user .bh-c-msg-bubble {
    background: var(--bh-user-bubble);
    color: var(--bh-user-text);
    border-top-right-radius: 2px;
  }
 
  /* Error message variant */
  .bh-c-msg-error .bh-c-msg-bubble {
    background: rgba(196,106,54,0.06);
    border-color: rgba(196,106,54,0.25);
    color: var(--bh-signal);
    font-size: 0.86rem;
  }
 
  /* ============ TYPING INDICATOR ============ */
  .bh-c-typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    background: var(--bh-bg);
    border: 1px solid var(--bh-line);
    border-radius: 10px;
    border-top-left-radius: 2px;
    align-self: flex-start;
    max-width: 85%;
  }
  .bh-c-typing-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--bh-mute);
    animation: bhCTypingPulse 1.3s ease-in-out infinite;
  }
  .bh-c-typing-dot:nth-child(2) { animation-delay: 0.18s; }
  .bh-c-typing-dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes bhCTypingPulse {
    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
    30% { opacity: 1; transform: translateY(-2px); }
  }
 
  /* ============ INPUT ============ */
  .bh-c-input-area {
    border-top: 1px solid var(--bh-line);
    padding: 14px 16px;
    background: var(--bh-panel);
    flex-shrink: 0;
  }
  .bh-c-input-wrap {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    background: var(--bh-bg);
    border: 1px solid var(--bh-line);
    border-radius: 12px;
    padding: 10px 10px 10px 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .bh-c-input-wrap:focus-within {
    border-color: var(--bh-ink);
    box-shadow: 0 0 0 3px rgba(10,10,10,0.06);
  }
  .bh-c-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: 'Geist', sans-serif;
    font-size: 0.93rem;
    line-height: 1.5;
    color: var(--bh-ink);
    min-height: 20px;
    max-height: 120px;
    overflow-y: auto;
  }
  .bh-c-input::placeholder { color: var(--bh-mute); }
  .bh-c-send {
    flex-shrink: 0;
    width: 34px; height: 34px;
    display: grid; place-items: center;
    background: var(--bh-ink);
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .bh-c-send:hover:not(:disabled) {
    background: var(--bh-accent);
    transform: translateY(-1px);
  }
  .bh-c-send:disabled {
    background: var(--bh-line-strong);
    cursor: not-allowed;
  }
  .bh-c-send svg {
    width: 16px; height: 16px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
 
  /* ============ FOOTER ============ */
  .bh-c-footer {
    padding: 8px 16px 12px;
    background: var(--bh-panel);
    border-top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Geist Mono', monospace;
    font-size: 0.6rem;
    color: var(--bh-mute);
    letter-spacing: 0.08em;
    flex-shrink: 0;
  }
  .bh-c-footer-disclosure {
    text-transform: uppercase;
  }
  .bh-c-reset {
    background: transparent;
    border: none;
    color: var(--bh-mute);
    font-family: inherit;
    font-size: inherit;
    letter-spacing: inherit;
    text-transform: uppercase;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
    transition: color 0.15s;
  }
  .bh-c-reset:hover { color: var(--bh-signal); }
 
  /* ============ MOBILE ============ */
  @media (max-width: 520px) {
    #bh-c-root { bottom: 16px; right: 16px; left: 16px; }
    .bh-c-panel {
      width: 100%;
      height: calc(100vh - 32px);
      max-height: calc(100vh - 32px);
      bottom: 0;
      right: 0;
      border-radius: 12px;
    }
    .bh-c-trigger { align-self: flex-end; }
  }
 
  /* ============ REDUCED MOTION ============ */
  @media (prefers-reduced-motion: reduce) {
    #bh-c-root * { animation: none !important; transition: none !important; }
  }
  `;
 
  // ---------------------------------------------------------------
  // State
  // ---------------------------------------------------------------
  const state = {
    sessionId: null,
    messages: [],      // { role: "user"|"assistant"|"error", text: string }
    sending: false,
    open: false,
  };
 
  // Load persisted session
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const ageMs = Date.now() - (parsed.savedAt || 0);
      const maxAgeMs = CONFIG.sessionTTLHours * 60 * 60 * 1000;
      if (ageMs < maxAgeMs && parsed.sessionId) {
        state.sessionId = parsed.sessionId;
        state.messages = parsed.messages || [];
      }
    }
  } catch (_e) { /* localStorage may be unavailable */ }
 
  function persist() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({
        sessionId: state.sessionId,
        messages: state.messages,
        savedAt: Date.now(),
      }));
    } catch (_e) { /* ignore */ }
  }
 
  function clearPersist() {
    try { localStorage.removeItem(CONFIG.storageKey); } catch (_e) { /* ignore */ }
    state.sessionId = null;
    state.messages = [];
  }
 
  // ---------------------------------------------------------------
  // DOM builders
  // ---------------------------------------------------------------
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.startsWith("on") && typeof attrs[k] === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else {
          node.setAttribute(k, attrs[k]);
        }
      }
    }
    children.forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }
 
  function injectStyles() {
    const style = document.createElement("style");
    style.id = "bh-c-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }
 
  // ---------------------------------------------------------------
  // Root + widget
  // ---------------------------------------------------------------
  let rootEl, panelEl, messagesEl, inputEl, sendBtnEl, triggerEl;
 
  function buildWidget() {
    rootEl = el("div", { id: "bh-c-root", role: "region", "aria-label": "Bristlehome concierge" });
 
    // Trigger pill
    triggerEl = el("button",
      { class: "bh-c-trigger", type: "button", "aria-label": "Open Bristlehome concierge",
        onClick: togglePanel },
      el("span", { class: "bh-c-trigger-mark" }),
      document.createTextNode(CONFIG.title),
      el("span", { class: "bh-c-trigger-dot", "aria-hidden": "true" })
    );
 
    // Panel
    messagesEl = el("div", { class: "bh-c-messages", id: "bh-c-messages",
      role: "log", "aria-live": "polite", "aria-atomic": "false" });
 
    inputEl = el("textarea", {
      class: "bh-c-input",
      id: "bh-c-input",
      rows: "1",
      placeholder: "Tell us about your home…",
      maxlength: "4000",
      "aria-label": "Your message",
      onKeydown: onInputKeydown,
      onInput: autoSizeInput,
    });
 
    sendBtnEl = el("button",
      { class: "bh-c-send", type: "button", "aria-label": "Send message", onClick: sendCurrent },
      svgArrowIcon()
    );
 
    panelEl = el("div",
      { class: "bh-c-panel", role: "dialog", "aria-labelledby": "bh-c-title", "aria-modal": "false" },
      el("header", { class: "bh-c-header" },
        el("div", { class: "bh-c-header-brand" },
          el("div", { class: "bh-c-header-mark", "aria-hidden": "true" }),
          el("div", {},
            el("div", { class: "bh-c-header-title", id: "bh-c-title" }, "Bristlehome"),
            el("div", { class: "bh-c-header-subtitle" }, "Concierge")
          )
        ),
        el("div", { class: "bh-c-header-status", title: "Online" }, "Online"),
        el("button",
          { class: "bh-c-close", type: "button", "aria-label": "Close concierge", onClick: togglePanel },
          "×"
        )
      ),
      messagesEl,
      el("div", { class: "bh-c-input-area" },
        el("div", { class: "bh-c-input-wrap" }, inputEl, sendBtnEl)
      ),
      el("div", { class: "bh-c-footer" },
        el("span", { class: "bh-c-footer-disclosure" }, "AI CONCIERGE · OPUS 4.7"),
        el("button", { class: "bh-c-reset", type: "button", onClick: resetConversation }, "New conversation")
      )
    );
 
    rootEl.appendChild(triggerEl);
    rootEl.appendChild(panelEl);
    document.body.appendChild(rootEl);
  }
 
  function svgArrowIcon() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M7 17L17 7 M11 7h6v6");
    svg.appendChild(path);
    return svg;
  }
 
  // ---------------------------------------------------------------
  // Panel open/close
  // ---------------------------------------------------------------
  function togglePanel() {
    state.open = !state.open;
    if (state.open) {
      panelEl.classList.add("bh-c-open");
      triggerEl.style.display = "none";
      // Render welcome if no messages yet
      if (state.messages.length === 0) {
        addMessage("assistant",
          "Hello. I'm Bristlehome's AI concierge — happy to help arrange a cleaning visit or give you a quote. " +
          "May I start with the town you'd like service in?",
          { first: true });
      } else {
        renderAllMessages();
      }
      setTimeout(() => inputEl.focus(), 260);
    } else {
      panelEl.classList.remove("bh-c-open");
      triggerEl.style.display = "inline-flex";
    }
  }
 
  function resetConversation() {
    if (!confirm("Start a new conversation? This will clear your current chat.")) return;
    clearPersist();
    messagesEl.innerHTML = "";
    addMessage("assistant",
      "Hello. I'm Bristlehome's AI concierge — happy to help arrange a cleaning visit or give you a quote. " +
      "May I start with the town you'd like service in?",
      { first: true });
  }
 
  // ---------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------
  function addMessage(role, text, opts) {
    opts = opts || {};
    state.messages.push({ role, text });
    if (!opts.noPersist) persist();
    renderMessage({ role, text, first: !!opts.first });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
 
  function renderAllMessages() {
    messagesEl.innerHTML = "";
    let firstAssistantDone = false;
    state.messages.forEach((m) => {
      const isFirst = m.role === "assistant" && !firstAssistantDone;
      if (m.role === "assistant") firstAssistantDone = true;
      renderMessage({ role: m.role, text: m.text, first: isFirst });
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
 
  function renderMessage(m) {
    const roleClass = m.role === "error" ? "bh-c-msg-error"
                    : m.role === "user" ? "bh-c-msg-user"
                    : "bh-c-msg-assistant";
    const roleLabel = m.role === "user" ? "You"
                    : m.role === "error" ? "Notice"
                    : "Concierge";
    const firstClass = m.first ? " bh-c-msg-first" : "";
    const node = el("div",
      { class: `bh-c-msg ${roleClass}${firstClass}` },
      el("div", { class: "bh-c-msg-role" }, roleLabel),
      el("div", { class: "bh-c-msg-bubble" }, m.text)
    );
    messagesEl.appendChild(node);
  }
 
  // ---------------------------------------------------------------
  // Typing indicator
  // ---------------------------------------------------------------
  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    typingEl = el("div",
      { class: "bh-c-typing", "aria-label": "Concierge is typing" },
      el("span", { class: "bh-c-typing-dot" }),
      el("span", { class: "bh-c-typing-dot" }),
      el("span", { class: "bh-c-typing-dot" })
    );
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }
 
  // ---------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------
  function onInputKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCurrent();
    }
    if (e.key === "Escape") togglePanel();
  }
 
  function autoSizeInput() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(120, inputEl.scrollHeight) + "px";
  }
 
  async function sendCurrent() {
    const text = (inputEl.value || "").trim();
    if (!text || state.sending) return;
    inputEl.value = "";
    autoSizeInput();
    addMessage("user", text);
    await callConcierge(text);
  }
 
  // ---------------------------------------------------------------
  // API
  // ---------------------------------------------------------------
  async function callConcierge(userMessage) {
    state.sending = true;
    sendBtnEl.disabled = true;
    inputEl.disabled = true;
    showTyping();
 
    try {
      const body = { message: userMessage };
      if (state.sessionId) body.session_id = state.sessionId;
 
      const resp = await fetch(CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json().catch(() => ({}));
 
      hideTyping();
 
      if (!resp.ok) {
        if (resp.status === 429) {
          addMessage("error", "We've hit a daily limit on this connection. Please contact our team directly at hello@bristlehome.com or try again tomorrow.");
        } else if (resp.status === 410) {
          addMessage("error", "This conversation has ended. Start a new one from the bottom of the panel.");
        } else {
          addMessage("error", data.error === "missing_anthropic_key"
            ? "The concierge is temporarily offline. Please email us at hello@bristlehome.com and we'll respond directly."
            : "I ran into an issue. Please try again or email hello@bristlehome.com.");
        }
        return;
      }
 
      if (data.session_id) {
        state.sessionId = data.session_id;
      }
      if (data.reply) {
        addMessage("assistant", data.reply);
      }
      if (data.status === "escalated") {
        // session ended — subtle note
      }
    } catch (_err) {
      hideTyping();
      addMessage("error", "I couldn't reach our server. Check your connection and try again.");
    } finally {
      state.sending = false;
      sendBtnEl.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
    }
  }
 
  // ---------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------
  function boot() {
    if (document.getElementById("bh-c-root")) return; // already mounted
    injectStyles();
    buildWidget();
    if (CONFIG.openOnLoad) togglePanel();
  }
 
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
