export const styles = `
.cocoon-chat-bubble {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 999999;
}

.cocoon-chat-bubble:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.cocoon-chat-bubble svg {
  width: 32px;
  height: 32px;
  fill: white;
}

.cocoon-chat-panel {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 380px;
  height: 600px;
  max-height: calc(100vh - 120px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  z-index: 999998;
  overflow: hidden;
  transition: opacity 0.2s, transform 0.2s;
}

.cocoon-chat-panel.hidden {
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
}

.cocoon-chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.cocoon-chat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.cocoon-chat-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.cocoon-chat-close:hover {
  opacity: 1;
}

.cocoon-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cocoon-chat-message {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.cocoon-chat-message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.cocoon-chat-message.assistant {
  align-self: flex-start;
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.cocoon-chat-message.loading {
  align-self: flex-start;
  background: #f3f4f6;
  color: #6b7280;
  font-style: italic;
}

.cocoon-chat-input-container {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.cocoon-chat-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  outline: none;
  transition: border-color 0.2s;
}

.cocoon-chat-input:focus {
  border-color: #667eea;
}

.cocoon-chat-send {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.cocoon-chat-send:hover:not(:disabled) {
  opacity: 0.9;
}

.cocoon-chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cocoon-chat-welcome {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.cocoon-chat-welcome h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1f2937;
}

.cocoon-chat-welcome p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 480px) {
  .cocoon-chat-panel {
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .cocoon-chat-bubble {
    bottom: 16px;
    right: 16px;
  }
}
`;
