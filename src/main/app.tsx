import { CSSProperties } from "react";

export function App() {
  async function sendMessage() {
    console.log("Posting message ...");
    const response = await window.agentApi.sendMessage("Testing! 🤘");
    console.log("response", response);
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

      <output className="grow p-2 shadow-md" />

      <div className="flex gap-2 m-2">
        <textarea
          name="user-prompt"
          rows={3}
          className="w-full border rounded-md p-2"
          placeholder="Enter your message here ..."
        />
        <button
          type="button"
          className="bg-amber-800 text-white text-lg px-8 py-2 rounded-lg cursor-pointer leading-none"
          onClick={sendMessage}
        >
          Send message
        </button>
      </div>
    </main>
  );
}
