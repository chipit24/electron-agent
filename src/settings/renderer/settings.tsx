import { useEffect, useState } from "react";

export function Settings() {
  const [apiKey, setApiKey] = useState("");
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await window.settingsApi.getApiKey();
        setApiKey(key || "");
      } catch (error) {
        console.error("Failed to fetch API key:", error);
      }
    };

    fetchApiKey();
  }, []);

  const handleClose = () => {
    window.settingsApi.closeWindow();
  };

  const handleSave = async () => {
    try {
      await window.settingsApi.setApiKey(apiKey);
      handleClose();
    } catch (error) {
      console.error("Failed to save API key:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <main className="p-2 font-serif flex flex-col gap-2 min-h-dvh">
      <h1 className="text-lg font-semibold text-amber-800 text-center">
        Settings
      </h1>

      <div className="flex flex-col my-auto p-2">
        <label htmlFor="apiKey" className="text-amber-800">
          Mistral API Key
        </label>
        <input
          aria-describedby="caption"
          type="text"
          name="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full py-2 px-3 bg-gray-50 rounded-lg border border-amber-500 text-amber-800 font-mono"
        />
        <p id="caption" className="text-sm">
          You can find your Mistral API key at{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://console.mistral.ai/api-keys"
            className="text-blue-700"
          >
            console.mistral.ai/api-keys
          </a>
        </p>
      </div>

      <div className="flex gap-2 justify-between">
        <button
          onClick={handleClose}
          className="bg-gray-100 text-amber-800 text-lg px-8 py-2 rounded-lg cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-amber-800 text-white text-lg px-8 py-2 rounded-lg cursor-pointer"
        >
          Save
        </button>
      </div>
    </main>
  );
}
