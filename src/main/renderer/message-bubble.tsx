export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  status: "sending" | "sent" | "error";
  toolCall?: {
    status: "pending" | "approved" | "rejected";
    description: string;
  };
};

export function MessageBubble({
  message,
  onHandleToolCall,
}: {
  message: Message;
  onHandleToolCall?: (approve: boolean) => void;
}) {
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

        {message.toolCall && (
          <div className="flex flex-col gap-2">
            <div className="font-mono bg-gray-700 text-gray-200 p-2 w-full rounded-lg">
              {message.toolCall.description}
            </div>
            <div className="flex justify-between">
              {message.toolCall.status === "pending" ? (
                <>
                  <button
                    type="button"
                    onClick={() => onHandleToolCall?.(true)}
                    className="px-2 py-1 bg-green-300 rounded-lg cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onHandleToolCall?.(false)}
                    className="px-2 py-1 bg-red-300 rounded-lg cursor-pointer"
                  >
                    Reject
                  </button>
                </>
              ) : message.toolCall.status === "approved" ? (
                <div className="px-2 py-1 bg-green-300 rounded-lg w-full text-center">
                  Approved
                </div>
              ) : (
                <div className="px-2 py-1 bg-red-300 rounded-lg w-full text-center">
                  Rejected
                </div>
              )}
            </div>
          </div>
        )}

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
