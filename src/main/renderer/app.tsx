import {
  type CSSProperties,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { type Message, MessageBubble } from "./message-bubble";
import MistralLogo from "./mistral-logo.svg?inline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export function App() {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>();
  const [maxTokens, setMaxTokens] = useState<number>();

  useEffect(() => {
    const getMaxContextLength = async () => {
      const maxContextLength = await window.agentApi.getMaxContextLength();
      setMaxTokens(maxContextLength);
    };

    if (hasApiKey) {
      getMaxContextLength();
    }
  }, [hasApiKey]);

  useEffect(() => {
    (async () => {
      const apiKeyExists = await window.agentApi.hasApiKey();
      setHasApiKey(apiKeyExists);
      setIsLoading(false);
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

    /* Add the new message to the screen right away, with a status of "sending" */
    setMessages([...messages, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const response = await window.agentApi.sendMessage(currentMessage.trim());

      setTokenUsage(response.usage);

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response.content,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        toolCall: response.toolCall
          ? { status: "pending", description: response.toolCall.description }
          : undefined,
      };

      setMessages([
        ...messages,
        { ...userMessage, status: "sent" },
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([...messages, { ...userMessage, status: "error" }]);
    }

    setIsLoading(false);
  }, [messages, currentMessage, isLoading]);

  const handleToolCall = useCallback(
    async (approve: boolean) => {
      if (isLoading) return;

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.toolCall) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await window.agentApi.executeToolCall(approve);
        setTokenUsage(response.usage);

        const updatedToolCallMessage: Message = {
          ...lastMessage,
          toolCall: {
            ...lastMessage.toolCall,
            status: approve ? "approved" : "rejected",
          },
        };

        const toolResultMessage: Message = {
          id: Date.now().toString(),
          content: response.content,
          role: "assistant",
          timestamp: new Date(),
          status: "sent",
        };

        setMessages(
          messages.toSpliced(-1, 1, updatedToolCallMessage, toolResultMessage)
        );
      } catch (error) {
        console.error("Error executing tool call:", error);
        const updatedToolCallMessage: Message = {
          ...lastMessage,
          status: "error",
          toolCall: {
            ...lastMessage.toolCall,
            status: "pending",
          },
        };
        setMessages(messages.toSpliced(-1, 1, updatedToolCallMessage));
      }

      setIsLoading(false);
    },
    [messages, isLoading]
  );

  const calculateRows = useCallback((text: string) => {
    if (!text) return 1;
    const lines = text.split("\n").length;
    return Math.min(lines, 5); // Cap at 5 rows for reasonable UI
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (event.metaKey || event.altKey) {
          // Manually insert newline when modifier keys are pressed
          event.preventDefault();
          const textarea = event.target as HTMLTextAreaElement;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const value = textarea.value;

          const newValue =
            value.substring(0, start) + "\n" + value.substring(end);
          setCurrentMessage(newValue);

          // Set cursor position after the inserted newline
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1;
          }, 0);
        } else {
          event.preventDefault();
          sendMessage();
        }
      }
    },
    [sendMessage]
  );

  return (
    <main className="flex flex-col h-dvh relative bg-gray-50">
      <div
        className="h-9 w-full absolute top-0 left-0 bg-white border-b border-gray-200 flex items-center justify-center"
        style={{ WebkitAppRegion: "drag" } as CSSProperties}
      />

      <h1 className="font-semibold text-lg h-9 relative w-full flex items-center justify-center text-gray-900">
        Electron Agent 🤖
      </h1>

      <section className="flex flex-col flex-1 overflow-y-auto p-2 gap-y-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              Start a conversation with your AI assistant
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onHandleToolCall={handleToolCall}
            />
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

      <div className="flex gap-2 m-2 items-end">
        {hasApiKey ? (
          <textarea
            name="user-prompt"
            rows={calculateRows(currentMessage)}
            className="w-full bg-white border border-gray-300 p-3 rounded-lg leading-5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent custom-scrollbar"
            placeholder="Type your message ..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        ) : (
          <p className="text-red-600 text-balance bg-red-50 border border-red-200 py-3 px-4 rounded-lg leading-5">
            No API key is configured. Please set up your Mistral API key in the
            settings to use the agent.
          </p>
        )}

        <button
          disabled={!hasApiKey || isLoading || !currentMessage.trim()}
          type="button"
          className="bg-blue-600 not-disabled:hover:bg-blue-700 text-white size-11.5 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center shrink"
          onClick={sendMessage}
        >
          <PaperAirplaneIcon className="size-5" />
        </button>
      </div>

      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 border-t border-gray-200 flex items-center justify-between gap-2">
        <div>
          {tokenUsage ? tokenUsage.totalTokens.toLocaleString() : "0"} /{" "}
          {maxTokens?.toLocaleString() || "--"} |{" "}
          {tokenUsage && maxTokens
            ? (
                ((maxTokens - tokenUsage.totalTokens) / maxTokens) *
                100
              ).toFixed(2)
            : "100.00"}
          % of context remaining
        </div>
        <div className="flex gap-1 items-center">
          Powered by
          <a
            href="https://mistral.ai/news/devstral"
            target="_blank"
            rel="noreferrer"
            className="text-[#FF8205] flex items-center gap-1"
          >
            Devstral
            <img src={MistralLogo} alt="Mistral logo" className="h-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
