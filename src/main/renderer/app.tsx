import { CSSProperties, useState, useEffect } from "react";

export function App() {
  const [message, setMessage] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);

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

  async function sendMessage() {
    if (!message.trim()) return;

    console.log("Posting message ...");
    const response = await window.agentApi.sendMessage(message.trim());
    console.log("response", response);
    setMessage("");
  }

  return (
    <main className="flex flex-col h-dvh font-serif relative bg-amber-50">
      <div
        className="h-9 w-full absolute top-0 left-0 bg-amber-100 flex items-center justify-center"
        style={{ WebkitAppRegion: "drag" } as CSSProperties}
      />

      <h1 className="font-semibold text-lg h-9 relative w-full flex items-center justify-center">
        Electron Agent 🤖
      </h1>

      <section className="grow p-2 shadow-md relative">
        <p>Messages will appear here ...</p>
      </section>

      <div className="flex gap-2 m-2">
        {hasApiKey ? (
          <textarea
            name="user-prompt"
            rows={3}
            className="w-full bg-white py-2 px-4 rounded-bl-md leading-5"
            placeholder="Enter your message here ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        ) : (
          <p className="text-red-700 text-balance bg-white py-2 px-4 rounded-bl-md leading-5">
            No API key is configured. Please set up your Mistral API key in the
            settings to use the agent.
          </p>
        )}

        <button
          disabled={!hasApiKey}
          type="button"
          className="bg-amber-800 text-white text-lg px-8 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed leading-none"
          onClick={sendMessage}
        >
          Send message
        </button>
      </div>
    </main>
  );
}
