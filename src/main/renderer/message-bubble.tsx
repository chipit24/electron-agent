import { ExclamationCircleIcon, EyeIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useState } from "react";
import { html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";

export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  status: "sending" | "sent" | "error";
  toolCall?: {
    status: "pending" | "approved" | "rejected";
    description: string;
    diff?: string;
    filePath?: string;
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
  const [showDiff, setShowDiff] = useState(false);

  const renderDiffHtml = (diff: string) => {
    return html(diff, {
      drawFileList: false,
      matching: "lines",
      outputFormat: "side-by-side",
      renderNothingWhenEmpty: true,
    });
  };

  return (
    <div
      className={clsx(
        "max-w-[560px] px-4 py-3 relative flex rounded-2xl group flex-col gap-2",
        isUser
          ? "self-end bg-blue-600 text-white rounded-br-md"
          : "self-start bg-gray-100 text-gray-900 rounded-bl-md"
      )}
    >
      <p className="whitespace-pre-wrap break-words">{message.content}</p>

      {message.toolCall && (
        <div className="flex flex-col gap-2">
          <div className="font-mono bg-gray-700 text-gray-200 p-2 w-full rounded-lg">
            {message.toolCall.description}
          </div>

          {message.toolCall.diff && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDiff(!showDiff)}
                className="px-2 py-1 bg-blue-300 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <EyeIcon className="size-4" />
                {showDiff ? "Hide" : "Show"} Diff
              </button>
            </div>
          )}

          {showDiff && message.toolCall.diff && (
            <div className="bg-white border rounded-lg max-h-96 overflow-auto">
              {message.toolCall.filePath && (
                <div className="bg-gray-50 border-b px-4 py-2 font-mono text-sm text-gray-700">
                  {message.toolCall.filePath}
                </div>
              )}
              <div
                className="p-4"
                dangerouslySetInnerHTML={{
                  __html: renderDiffHtml(message.toolCall.diff),
                }}
              />
            </div>
          )}

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
        className={clsx(
          "text-xs absolute top-full flex gap-1 whitespace-nowrap items-center right-0",
          isUser ? "right-1" : "left-1",
          isError
            ? "text-red-600"
            : "opacity-0 group-hover:opacity-100 transition-opacity text-gray-500"
        )}
      >
        {message.timestamp.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}
        {isUser && isError && <ExclamationCircleIcon className="size-3" />}
      </p>
    </div>
  );
}
