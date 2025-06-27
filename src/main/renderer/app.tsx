import {
  CSSProperties,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { type Message, MessageBubble } from "./message-bubble";

export function App() {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async function () {
      const apiKeyExists = await window.agentApi.hasApiKey();
      setHasApiKey(apiKeyExists);
    })();

    const unsubscribe = window.agentApi.onApiKeyChanged((hasApiKey) => {
      setHasApiKey(hasApiKey);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const sendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage.trim(),
      role: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const response = await window.agentApi.sendMessage(currentMessage.trim());

      // Update user message status to sent
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === userMessage.id
            ? { ...message, status: "sent" }
            : message
        )
      );

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: response || "<Empty Response>",
          role: "assistant",
          timestamp: new Date(),
          status: "sent",
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Update user message status to error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "error" } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, isLoading]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && event.metaKey) {
        event.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <main className="flex flex-col h-dvh font-serif relative bg-amber-50">
      <div
        className="h-9 w-full absolute top-0 left-0 bg-amber-100 flex items-center justify-center"
        style={{ WebkitAppRegion: "drag" } as CSSProperties}
      />

      <h1 className="font-semibold text-lg h-9 relative w-full flex items-center justify-center">
        Electron Agent 🤖
      </h1>

      <section className="flex flex-col flex-1 overflow-y-auto p-2 gap-y-1 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-amber-600 text-center opacity-70">
              Start a conversation with your AI assistant
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {isLoading && (
          <div className="flex justify-start mb-2">
            <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs lg:max-w-md">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="flex gap-2 m-2">
        {hasApiKey ? (
          <textarea
            name="user-prompt"
            rows={3}
            className="w-full bg-white py-2 px-4 rounded-bl-md leading-5 resize-none"
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        ) : (
          <p className="text-red-700 text-balance bg-white py-2 px-4 rounded-bl-md leading-5">
            No API key is configured. Please set up your Mistral API key in the
            settings to use the agent.
          </p>
        )}

        <button
          disabled={!hasApiKey || isLoading || !currentMessage.trim()}
          type="button"
          className="bg-amber-800 text-white text-lg px-8 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 leading-none transition-opacity"
          onClick={sendMessage}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </main>
  );
}
