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
        className={`max-w-md px-4 py-2 rounded-2xl ${
          isUser
            ? `bg-amber-500 text-white ${
                isError
                  ? "bg-red-500"
                  : isSending
                    ? "bg-amber-400"
                    : "bg-amber-500"
              } rounded-br-md`
            : "bg-gray-200 text-gray-800 rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`text-xs font-thin mt-1 ${
            isUser ? "text-amber-100" : "text-gray-500"
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
