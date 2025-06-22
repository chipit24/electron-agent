export function App() {
  return (
    <main className="p-6 flex flex-col gap-2 h-dvh">
      <h1 className="font-semibold text-xl">Electron Agent 🤖</h1>
      <output className="h-full w-full border rounded-md p-2" />
      <textarea
        name="user-prompt"
        rows={3}
        className="w-full border rounded-md p-2"
        placeholder="Enter your message here ..."
      />
    </main>
  );
}
