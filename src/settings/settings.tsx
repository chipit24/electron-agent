export function Settings() {
  return (
    <main className="px-6 py-4 font-serif flex flex-col gap-2 min-h-dvh">
      <h1 className="text-2xl font-bold text-amber-800">Settings</h1>

      <div className="flex flex-col my-auto">
        <label htmlFor="apiKey" className="text-amber-800">
          API Key
        </label>
        <input
          type="text"
          name="apiKey"
          className="w-full py-2 px-3 bg-gray-50 rounded-lg border border-amber-500 text-amber-800"
        />
      </div>

      <div className="flex gap-2 justify-between">
        <button className="bg-gray-100 text-amber-800 text-lg px-8 py-2 rounded-lg cursor-pointer">
          Cancel
        </button>
        <button className="bg-amber-800 text-white text-lg px-8 py-2 rounded-lg cursor-pointer">
          Save
        </button>
      </div>
    </main>
  );
}
