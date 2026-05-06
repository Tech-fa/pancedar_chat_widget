(function () {
  const WIDGET_ID = "tech-fa-chat-widget";
  const TOGGLE_ID = "tech-fa-chat-toggle";
  const BOX_ID = "tech-fa-chat-box";
  // Replaced by `npm run build` with JSON.stringify(public/chat-widget.template.html).
  const EMBEDDED_TEMPLATE_SOURCE = "___CHAT_WIDGET_EMBEDDED_TEMPLATE___";

  function createStyles() {
    if (document.getElementById(WIDGET_ID + "-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = WIDGET_ID + "-styles";
    style.textContent = `
            #${WIDGET_ID} {
                position: fixed;
                right: 20px;
                bottom: 20px;
                z-index: 9999;
                font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }

            #${TOGGLE_ID} {
                width: 56px;
                height: 56px;
                border: none;
                border-radius: 50%;
                background: #2563eb;
                color: #ffffff;
                cursor: pointer;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
            }

            #${TOGGLE_ID} img {
                width: 28px;
                height: 28px;
                object-fit: contain;
            }

            #${TOGGLE_ID}:hover {
                background: #1d4ed8;
            }

            #${BOX_ID} {
                width: 320px;
                height: 420px;
                border-radius: 12px;
                background: #ffffff;
                box-shadow: 0 14px 30px rgba(0, 0, 0, 0.25);
                margin-bottom: 12px;
                display: none;
                overflow: hidden;
                border: 1px solid #e5e7eb;
            }

            #${BOX_ID}[data-open="true"] {
                display: flex;
                flex-direction: column;
            }

            #${BOX_ID} .chat-header {
                padding: 12px 16px;
                background: #2563eb;
                color: #ffffff;
                font-weight: 600;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            #${BOX_ID} .chat-header-title {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
            }

            #${BOX_ID} .chat-avatar {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #dbeafe;
                color: #1d4ed8;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                font-size: 11px;
                font-weight: 700;
                overflow: hidden;
                text-transform: uppercase;
            }

            #${BOX_ID} .chat-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            #${BOX_ID} .chat-header button {
                border: none;
                background: transparent;
                color: #ffffff;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
            }

            #${BOX_ID} .chat-body {
                padding: 16px;
                color: #111827;
                font-size: 14px;
                line-height: 1.5;
                background: #f9fafb;
                flex: 1;
                min-height: 0;
                display: flex;
                flex-direction: column;
            }

            #${BOX_ID} .chat-meta {
                color: #6b7280;
                font-size: 12px;
                margin-top: 8px;
            }

            #${BOX_ID} .chat-messages {
                display: flex;
                flex: 1;
                flex-direction: column;
                gap: 10px;
                overflow-y: auto;
                padding-right: 2px;
            }

            #${BOX_ID} .chat-empty {
                color: #6b7280;
                margin: auto;
                text-align: center;
                font-size: 13px;
            }

            #${BOX_ID} .chat-message-row {
                display: flex;
                align-items: flex-end;
                gap: 8px;
            }

            #${BOX_ID} .chat-message-row.user {
                justify-content: flex-end;
            }

            #${BOX_ID} .chat-message-row.ai {
                justify-content: flex-start;
            }

            #${BOX_ID} .chat-message {
                max-width: 75%;
                padding: 9px 11px;
                border-radius: 14px;
                white-space: pre-wrap;
                word-break: break-word;
            }

            #${BOX_ID} .chat-message-row.user .chat-message {
                background: #2563eb;
                color: #ffffff;
                border-bottom-right-radius: 4px;
            }

            #${BOX_ID} .chat-message-row.ai .chat-message {
                background: #ffffff;
                color: #1f2937;
                border: 1px solid #e5e7eb;
                border-bottom-left-radius: 4px;
            }

            #${BOX_ID} .chat-composer {
                display: flex;
                align-items: flex-end;
                gap: 8px;
                padding: 12px;
                border-top: 1px solid #e5e7eb;
                background: #ffffff;
            }

            #${BOX_ID} .chat-composer textarea {
                flex: 1;
                border: 1px solid #d1d5db;
                border-radius: 12px;
                padding: 9px 12px;
                outline: none;
                min-width: 0;
                resize: none;
                font: inherit;
                line-height: 1.4;
            }

            #${BOX_ID} .chat-composer textarea:focus {
                border-color: #2563eb;
                box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.14);
            }

            #${BOX_ID} .chat-composer .chat-send {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 999px;
                background: #2563eb;
                color: #ffffff;
                cursor: pointer;
                padding: 0;
            }

            #${BOX_ID} .chat-composer .chat-send:disabled,
            #${BOX_ID} .chat-composer textarea:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }
        `;
    document.head.appendChild(style);
  }

  function parseTemplate(templateText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateText, "text/html");
    const template = doc.querySelector("template#tech-fa-chat-widget-template");
    if (!template) {
      throw new Error("Chat widget template was not found");
    }

    return template;
  }

  function setOpenState(box, isOpen) {
    box.setAttribute("data-open", String(isOpen));
    box.setAttribute("aria-hidden", String(!isOpen));
  }

  function setApiStatus(root, statusText) {
    const statusElement = root.querySelector("[data-api-status]");
    if (statusElement) {
      statusElement.textContent = "status: " + statusText;
    }
  }

  function getInitials(name) {
    return (
      String(name || "AI")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (part) {
          return part.charAt(0);
        })
        .join("")
        .toUpperCase() || "AI"
    );
  }

  function setComposerEnabled(root, isEnabled) {
    const input = root.querySelector("[data-chat-input]");
    const button = root.querySelector("[data-chat-form] .chat-send");
    if (input) {
      input.disabled = !isEnabled;
    }
    if (button) {
      button.disabled = !isEnabled;
    }
  }

  function setAiIdentity(root, aiName, aiIcon) {
    const name = aiName || "Chat Support";
    const nameElement = root.querySelector("[data-ai-name]");
    const avatarElement = root.querySelector("[data-ai-avatar]");

    if (nameElement) {
      nameElement.textContent = name;
    }

    if (!avatarElement) {
      return;
    }

    avatarElement.textContent = "";
    if (aiIcon) {
      const image = document.createElement("img");
      image.src = aiIcon;
      image.alt = name;
      avatarElement.appendChild(image);
      return;
    }

    avatarElement.textContent = getInitials(name);
  }

  function setChatAccentColor(root, accentColor) {
    const toggleElement = root.querySelector("#" + TOGGLE_ID);
    const headerElement = root.querySelector(".chat-header");
    const sendButton = root.querySelector("[data-chat-form] .chat-send");
    if (!accentColor) {
      return;
    }
    if (toggleElement) {
      toggleElement.style.background = accentColor;
    }
    if (headerElement) {
      headerElement.style.background = accentColor;
    }
    if (sendButton) {
      sendButton.style.background = accentColor;
    }
  }

  function setToggleVisibility(root, hideCircle) {
    const toggleElement = root.querySelector("#" + TOGGLE_ID);
    if (toggleElement) {
      toggleElement.style.display = hideCircle ? "none" : "flex";
    }
  }

  function setChatIcon(root, chatIcon) {
    const toggleElement = root.querySelector("#" + TOGGLE_ID);
    const icon = String(chatIcon || "").trim();
    if (!toggleElement || !icon) {
      return;
    }

    toggleElement.textContent = "";
    if (/^(https?:\/\/|data:image\/)/i.test(icon)) {
      const image = document.createElement("img");
      image.src = icon;
      image.alt = "Open chat";
      toggleElement.appendChild(image);
      return;
    }

    toggleElement.textContent = icon;
  }

  function createSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
  }

  function getStoredSessionId(appName) {
    const storageKey = WIDGET_ID + ":session:" + String(appName || "").trim();
    try {
      const storedSessionId = window.sessionStorage.getItem(storageKey);
      if (storedSessionId) {
        return storedSessionId;
      }

      const sessionId = createSessionId();
      window.sessionStorage.setItem(storageKey, sessionId);
      return sessionId;
    } catch (_error) {
      return createSessionId();
    }
  }

  function applyWidgetTheme(root, theme) {
    setChatAccentColor(
      root,
      theme.colorTheme || theme.chatWidgetColor || theme.color || "",
    );
    setChatIcon(root, theme.chatIcon || "");
    setToggleVisibility(root, Boolean(theme.hideCircle));
  }

  function getAssistantIdentity(theme) {
    return {
      aiName: theme.assistantName || theme.aiName || "Chat Support",
      aiIcon: theme.assistantIcon || theme.aiIcon || "",
    };
  }

  async function loadWidgetTheme(appName) {
    try {
      const requestUrl = new URL(
        `__VITE_API_URL__/connector/chat-widget/init`,
        window.location.origin,
      );
      const response = await fetch(requestUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appName }),
      });

      if (!response.ok) {
        return {};
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return {};
      }

      return await response.json();
    } catch (_error) {
      return {};
    }
  }

  function appendMessage(root, role, text, aiName, aiIcon) {
    const messagesElement = root.querySelector("[data-chat-messages]");
    if (!messagesElement || !text) {
      return;
    }

    const emptyElement = root.querySelector("[data-chat-empty]");
    if (emptyElement) {
      emptyElement.remove();
    }

    const row = document.createElement("div");
    row.className = "chat-message-row " + (role === "user" ? "user" : "ai");

    if (role !== "user") {
      const avatar = document.createElement("span");
      avatar.className = "chat-avatar";
      if (aiIcon) {
        const image = document.createElement("img");
        image.src = aiIcon;
        image.alt = aiName || "AI";
        avatar.appendChild(image);
      } else {
        avatar.textContent = getInitials(aiName);
      }
      row.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = "chat-message";
    bubble.textContent = text;
    row.appendChild(bubble);

    messagesElement.appendChild(row);
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }

  function normalizeSocketMessage(event) {
    if (typeof event.data !== "string") {
      return { role: "ai", text: String(event.data || "") };
    }

    try {
      const payload = JSON.parse(event.data);
      return {
        role: payload.type,
        text: payload.message || payload.content || payload.text || "",
      };
    } catch (_error) {
      return { role: "ai", text: event.data };
    }
  }

  function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }

  async function signChatWidgetTimestamp(secret, timestamp) {
    const key = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await window.crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(JSON.stringify({ timestamp: timestamp })),
    );

    return arrayBufferToHex(signature);
  }

  function scheduleReconnect(root, state) {
    if (state.reconnectTimer) {
      return;
    }

    setApiStatus(root, "reconnecting");
    state.reconnectTimer = window.setTimeout(function () {
      state.reconnectTimer = null;
      void loadChatData(root, state, { isReconnect: true });
    }, state.reconnectDelayMs);
  }

  async function loadChatData(root, state, options) {
    if (state.isRegistering) {
      return;
    }

    state.isRegistering = true;
    try {
      setApiStatus(root, "loading");
      setComposerEnabled(root, false);
      const requestUrl = new URL(
        `__VITE_API_URL__/connector/chat-widget/register`,
        window.location.origin,
      );
      const timestamp = Date.now().toString();
      const signature = await signChatWidgetTimestamp(state.secret, timestamp);

      const response = await fetch(requestUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-chat-widget-signature": signature,
          "x-chat-widget-timestamp": timestamp,
        },
        body: JSON.stringify({
          appName: state.appName,
          sessionId: state.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      const contentType = response.headers.get("content-type") || "";
      let body;
      if (contentType.includes("application/json")) {
        body = await response.json();
      } else {
        throw new Error("Expected JSON response");
      }

      const websocketUrl = body.websocketUrl;
      if (!websocketUrl) {
        throw new Error("Response is missing websocketUrl");
      }

      const socket = new WebSocket(websocketUrl);
      state.socket = socket;
      socket.addEventListener("open", function () {
        setApiStatus(root, "connected");
        setComposerEnabled(root, true);
      });
      socket.addEventListener("message", function (event) {
        const message = normalizeSocketMessage(event);
        appendMessage(
          root,
          message.role,
          message.text,
          state.aiName,
          state.aiIcon,
        );
      });
      socket.addEventListener("close", function () {
        if (state.socket !== socket) {
          return;
        }

        setApiStatus(root, "disconnected");
        setComposerEnabled(root, false);
        scheduleReconnect(root, state);
      });
      socket.addEventListener("error", function () {
        setApiStatus(root, "connection error");
        setComposerEnabled(root, false);
      });
      if (!options.isReconnect && !state.hasShownGreeting) {
        state.hasShownGreeting = true;
        appendMessage(
          root,
          "ai",
          body.greetingMessage,
          state.aiName,
          state.aiIcon,
        );
      }
    } catch (error) {
      const message = "Failed to connect to chat widget";
      setApiStatus(root, "error");
      if (!options.isReconnect) {
        appendMessage(
          root,
          "ai",
          "Failed to connect: " + message,
          state.aiName,
        );
      } else {
        scheduleReconnect(root, state);
      }
    } finally {
      state.isRegistering = false;
    }
  }

  function bindListeners(root, box, options) {
    const toggle = root.querySelector("#" + TOGGLE_ID);
    const closeButton = root.querySelector("[data-chat-close]");
    const form = root.querySelector("[data-chat-form]");
    const input = root.querySelector("[data-chat-input]");
    if (!toggle) {
      throw new Error("Chat widget toggle element is missing");
    }

    let hasLoadedOnOpen = false;
    const state = {
      socket: null,
      appName: options.appName,
      secret: options.secret,
      sessionId: getStoredSessionId(options.appName),
      isRegistering: false,
      reconnectTimer: null,
      reconnectDelayMs: 1500,
      hasShownGreeting: false,
      aiName: options.aiName || "Chat Support",
      aiIcon: options.aiIcon || "",
    };

    toggle.addEventListener("click", function () {
      const isOpen = box.getAttribute("data-open") === "true";
      const shouldOpen = !isOpen;
      setOpenState(box, shouldOpen);

      if (shouldOpen && !hasLoadedOnOpen) {
        hasLoadedOnOpen = true;
        void loadChatData(root, state, { isReconnect: false });
      }
    });

    if (closeButton) {
      closeButton.addEventListener("click", function () {
        setOpenState(box, false);
      });
    }

    if (form && input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (typeof form.requestSubmit === "function") {
            form.requestSubmit();
          } else {
            form.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true }),
            );
          }
        }
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const message = input.value.trim();
        if (
          !message ||
          !state.socket ||
          state.socket.readyState !== WebSocket.OPEN
        ) {
          return;
        }

        state.socket.send(JSON.stringify({ message }));
        appendMessage(root, "user", message, state.aiName, state.aiIcon);
        input.value = "";
        input.focus();
      });
    }
  }

  function hydrateWidget(root, options) {
    const box = root.querySelector("#" + BOX_ID);
    if (!box) {
      throw new Error("Chat widget container element is missing");
    }

    setApiStatus(root, "idle");
    setAiIdentity(root, options.aiName || "Chat Support", options.aiIcon || "");
    setComposerEnabled(root, false);
    setOpenState(box, false);
    bindListeners(root, box, options);
  }

  async function createWidget(options) {
    if (document.getElementById(WIDGET_ID)) {
      return;
    }

    const templateText = EMBEDDED_TEMPLATE_SOURCE;
    const template = parseTemplate(templateText);
    const fragment = template.content.cloneNode(true);
    const root = fragment.querySelector("#" + WIDGET_ID);
    if (!root) {
      throw new Error("Chat widget root element is missing");
    }

    const theme = await loadWidgetTheme(options.appName);
    const assistantIdentity = getAssistantIdentity(theme);
    hydrateWidget(root, Object.assign({}, options, assistantIdentity));
    applyWidgetTheme(root, theme);
    document.body.appendChild(fragment);
  }

  async function init(options) {
    createStyles();
    await createWidget({ appName: options.appName, secret: options.secret });
  }

  window.TechFAChatWidget = {
    init,
  };
})();
