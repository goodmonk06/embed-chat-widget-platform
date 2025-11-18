import { styles } from './styles';

interface CocoonChatConfig {
  siteKey: string;
  apiUrl?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

class CocoonChatWidget {
  private siteKey: string;
  private apiUrl: string;
  private sessionKey: string | null = null;
  private messages: Message[] = [];
  private isOpen = false;
  private isLoading = false;

  private bubbleEl: HTMLElement | null = null;
  private panelEl: HTMLElement | null = null;
  private messagesEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private sendBtn: HTMLButtonElement | null = null;

  constructor(config: CocoonChatConfig) {
    this.siteKey = config.siteKey;
    this.apiUrl = config.apiUrl || 'http://localhost:3001';

    this.init();
  }

  private async init() {
    this.injectStyles();
    this.createBubble();
    this.createPanel();
    await this.initSession();
  }

  private injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  private createBubble() {
    this.bubbleEl = document.createElement('div');
    this.bubbleEl.className = 'cocoon-chat-bubble';
    this.bubbleEl.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    `;
    this.bubbleEl.addEventListener('click', () => this.togglePanel());
    document.body.appendChild(this.bubbleEl);
  }

  private createPanel() {
    this.panelEl = document.createElement('div');
    this.panelEl.className = 'cocoon-chat-panel hidden';
    this.panelEl.innerHTML = `
      <div class="cocoon-chat-header">
        <h3>Chat with us</h3>
        <button class="cocoon-chat-close">&times;</button>
      </div>
      <div class="cocoon-chat-messages">
        <div class="cocoon-chat-welcome">
          <h4>👋 Welcome!</h4>
          <p>How can we help you today?</p>
        </div>
      </div>
      <div class="cocoon-chat-input-container">
        <input type="text" class="cocoon-chat-input" placeholder="Type your message..." />
        <button class="cocoon-chat-send">Send</button>
      </div>
    `;

    document.body.appendChild(this.panelEl);

    // Get references
    this.messagesEl = this.panelEl.querySelector('.cocoon-chat-messages');
    this.inputEl = this.panelEl.querySelector('.cocoon-chat-input');
    this.sendBtn = this.panelEl.querySelector('.cocoon-chat-send');

    // Event listeners
    const closeBtn = this.panelEl.querySelector('.cocoon-chat-close');
    closeBtn?.addEventListener('click', () => this.togglePanel());

    this.inputEl?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isLoading) {
        this.sendMessage();
      }
    });

    this.sendBtn?.addEventListener('click', () => {
      if (!this.isLoading) {
        this.sendMessage();
      }
    });
  }

  private togglePanel() {
    this.isOpen = !this.isOpen;
    this.panelEl?.classList.toggle('hidden', !this.isOpen);

    if (this.isOpen && this.inputEl) {
      this.inputEl.focus();
    }
  }

  private async initSession() {
    try {
      const response = await fetch(`${this.apiUrl}/api/widget/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteKey: this.siteKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize session');
      }

      const data = await response.json();
      this.sessionKey = data.sessionKey;
    } catch (error) {
      console.error('Cocoon Chat: Failed to initialize session', error);
    }
  }

  private async sendMessage() {
    const message = this.inputEl?.value.trim();
    if (!message || !this.sessionKey) return;

    // Clear input
    if (this.inputEl) {
      this.inputEl.value = '';
    }

    // Add user message to UI
    this.addMessage({ role: 'user', content: message });

    // Show loading state
    this.setLoading(true);
    const loadingId = this.addLoadingMessage();

    try {
      const response = await fetch(`${this.apiUrl}/api/widget/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionKey: this.sessionKey,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Remove loading message
      this.removeLoadingMessage(loadingId);

      // Add assistant response
      this.addMessage({
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp),
      });
    } catch (error) {
      console.error('Cocoon Chat: Failed to send message', error);
      this.removeLoadingMessage(loadingId);
      this.addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      });
    } finally {
      this.setLoading(false);
    }
  }

  private addMessage(message: Message) {
    this.messages.push(message);

    // Remove welcome message if it exists
    const welcomeEl = this.messagesEl?.querySelector('.cocoon-chat-welcome');
    if (welcomeEl) {
      welcomeEl.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `cocoon-chat-message ${message.role}`;
    messageEl.textContent = message.content;

    this.messagesEl?.appendChild(messageEl);
    this.scrollToBottom();
  }

  private addLoadingMessage(): string {
    const loadingId = `loading-${Date.now()}`;
    const loadingEl = document.createElement('div');
    loadingEl.className = 'cocoon-chat-message loading';
    loadingEl.id = loadingId;
    loadingEl.textContent = 'Typing...';

    this.messagesEl?.appendChild(loadingEl);
    this.scrollToBottom();

    return loadingId;
  }

  private removeLoadingMessage(loadingId: string) {
    const loadingEl = document.getElementById(loadingId);
    loadingEl?.remove();
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
    if (this.sendBtn) {
      this.sendBtn.disabled = loading;
    }
    if (this.inputEl) {
      this.inputEl.disabled = loading;
    }
  }

  private scrollToBottom() {
    if (this.messagesEl) {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
  }

  // Public API
  public open() {
    if (!this.isOpen) {
      this.togglePanel();
    }
  }

  public close() {
    if (this.isOpen) {
      this.togglePanel();
    }
  }

  public destroy() {
    this.bubbleEl?.remove();
    this.panelEl?.remove();
  }
}

// Global function to create widget
(window as any).createCocoonChatWidget = function(config: CocoonChatConfig) {
  return new CocoonChatWidget(config);
};

// TypeScript declaration
declare global {
  interface Window {
    createCocoonChatWidget: (config: CocoonChatConfig) => CocoonChatWidget;
  }
}

export { CocoonChatWidget, CocoonChatConfig };
