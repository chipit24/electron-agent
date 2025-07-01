export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  status: "sending" | "sent" | "error";
};

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isSending = message.status === "sending";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? `bg-blue-600 text-white ${
                isError
                  ? "bg-red-500"
                  : isSending
                    ? "bg-blue-400"
                    : "bg-blue-600"
              } rounded-br-md`
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isUser && (
            <span className="ml-1">
              {isSending ? "○" : isError ? "!" : "✓"}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
