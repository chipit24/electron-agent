export function App() {
  async function sendMessage() {
    console.log("Posting message ...");
    const response = await window.agentApi.sendMessage("Testing! 🤘");
    console.log("response", response);
  }

  return (
    <main className="px-6 py-4 flex flex-col gap-2 h-dvh">
      <h1 className="font-serif font-semibold text-xl">Electron Agent 🤖</h1>
      <output className="h-full w-full border rounded-md p-2" />

      <div className="flex">
        <textarea
          name="user-prompt"
          rows={3}
          className="w-full border rounded-md p-2"
          placeholder="Enter your message here ..."
        />
        <button
          type="button"
          className="border rounded-md p-2 ml-2 hover:cursor-pointer hover:bg-gray-200 active:bg-gray-300"
          onClick={sendMessage}
        >
          Send message
        </button>
      </div>
    </main>
  );
}
