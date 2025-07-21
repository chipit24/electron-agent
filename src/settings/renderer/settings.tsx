import { useEffect, useState } from "react";

export function Settings() {
  const settings = window.settingsApi.getSettings();

  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [projectDirectory, setProjectDirectory] = useState(
    settings.projectDirectory
  );

  const handleClose = () => {
    window.settingsApi.closeWindow();
  };

  const handleSave = async () => {
    try {
      await window.settingsApi.setSettings({ apiKey, projectDirectory });
      handleClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
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
    <main className="p-6 flex flex-col gap-4 min-h-dvh bg-gray-50">
      <h1 className="text-xl font-semibold text-gray-900 text-center">
        Settings
      </h1>

      <div className="flex flex-col my-auto gap-6 p-4 bg-white rounded-xl border border-gray-200">
        <div>
          <label
            htmlFor="apiKey"
            className="text-gray-700 font-medium mb-2 block"
          >
            Mistral API Key
          </label>
          <input
            aria-describedby="apiKeyCaption"
            type="text"
            name="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full py-3 px-4 bg-white rounded-lg border border-gray-300 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p id="apiKeyCaption" className="text-sm text-gray-600 mt-2">
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

        <div>
          <label
            htmlFor="projectDirectory"
            className="text-gray-700 font-medium mb-2 block"
          >
            Project Directory
          </label>
          <input
            aria-describedby="projectDirCaption"
            type="text"
            name="projectDirectory"
            value={projectDirectory}
            onChange={(e) => setProjectDirectory(e.target.value)}
            placeholder="/path/to/your/project"
            className="w-full py-3 px-4 bg-white rounded-lg border border-gray-300 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p id="projectDirCaption" className="text-sm text-gray-600 mt-2">
            This is the default directory Electron Agent 🤖 will scope its
            commands to.
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-between">
        <button
          onClick={handleClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg px-8 py-3 rounded-xl cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-xl cursor-pointer transition-colors"
        >
          Save
        </button>
      </div>
    </main>
  );
}
