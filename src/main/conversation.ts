import { Mistral } from "@mistralai/mistralai";
import type {
  ChatCompletionStreamRequestMessages,
  ToolCall,
  UsageInfo,
} from "@mistralai/mistralai/models/components";
import { createPatch } from "diff";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import coderSystemPrompt from "./coderSystemPrompt.txt?raw";
import { toolMap, agentToolList } from "./llmTools";
import { settingsStore } from "../settings/store";

export type ConversationMessageResponse = {
  content: string;
  usage: UsageInfo;
  toolCall?: { description: string; diff?: string; filePath?: string };
};

export type Tool<
  Params extends Record<string, unknown> = Record<string, unknown>,
> = (args: { projectRoot: string } & Params) => Promise<string>;

export class Conversation {
  static model = "devstral-medium-latest" as const;

  #client;
  #messages: ChatCompletionStreamRequestMessages[] = [
    { role: "system", content: coderSystemPrompt },
  ];
  #pendingToolCall: ToolCall | undefined;

  constructor(apiKey?: string) {
    this.#client = new Mistral({ apiKey });
  }

  setApiKey(apiKey: string) {
    this.#client = new Mistral({ apiKey });
  }

  async getMaxContentLength() {
    const modelCard = await this.#client.models.retrieve({
      modelId: Conversation.model,
    });

    return modelCard.maxContextLength;
  }

  #getPendingToolCallArguments<T = Record<string, unknown>>(): T | undefined {
    if (!this.#pendingToolCall) {
      return;
    }

    let parsedArguments: T;
    if (typeof this.#pendingToolCall.function.arguments === "string") {
      try {
        parsedArguments = JSON.parse(this.#pendingToolCall.function.arguments);
      } catch {
        throw new Error(
          `Tool call arguments must be a valid JSON object, but received unparseable string: ${this.#pendingToolCall.function.arguments}`
        );
      }
    } else {
      parsedArguments = this.#pendingToolCall.function.arguments as T;
    }

    return parsedArguments;
  }

  async #generateDiff(newContent: string, filePath: string): Promise<string> {
    const projectRoot = settingsStore.get("projectDirectory");
    if (!projectRoot) {
      throw new Error("Project directory not set in settings");
    }

    const fullFilePath = join(projectRoot, filePath);
    const originalContent = await readFile(fullFilePath, "utf8");

    return createPatch(filePath, originalContent, newContent, "", "");
  }

  async #generateCompletion() {
    const completion = await this.#client.chat.complete({
      model: Conversation.model,
      parallelToolCalls: false,
      tools: agentToolList,
      messages: this.#messages,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("\n<Completion>");
      console.log(JSON.stringify(completion, null, 2));
      console.log("</Completion>");
    }

    const message = completion.choices[0]?.message;
    this.add({ ...message, role: "assistant" });

    const toolCall = message.toolCalls?.[0];
    this.#pendingToolCall = toolCall;

    if (toolCall !== undefined && process.env.NODE_ENV !== "production") {
      console.log("\n<ToolCall>");
      console.log(JSON.stringify(toolCall, null, 2));
      console.log("</ToolCall>");
    }

    let toolCallData: ConversationMessageResponse["toolCall"];

    if (toolCall) {
      toolCallData = {
        description: `${toolCall.function.name}(${toolCall.function.arguments})`,
      };

      if (toolCall.function.name === "editFile") {
        const args = this.#getPendingToolCallArguments<{
          newContent: string;
          filePath: string;
        }>();
        toolCallData.filePath = args?.filePath;

        /* Generate diff for display purposes */
        if (args?.filePath && args?.newContent) {
          try {
            toolCallData.diff = await this.#generateDiff(
              args.newContent,
              args.filePath
            );
          } catch (error) {
            throw new Error(`Failed to generate diff for display: ${error}`);
          }
        }
      }
    }

    return {
      content: message.content as string,
      usage: completion.usage,
      toolCall: toolCallData,
    };
  }

  add(message: ChatCompletionStreamRequestMessages) {
    this.#messages.push(message);

    if (process.env.NODE_ENV !== "production") {
      console.log("\n<Messages>");
      console.log(
        JSON.stringify(
          this.#messages.map((m) => ({
            ...m,
            content:
              typeof m.content === "string" && m.content.length > 100
                ? m.content.substring(0, 100) + "..."
                : m.content,
          })),
          null,
          2
        )
      );
      console.log("</Messages>");
    }
  }

  sendMessage(userMessage: string): Promise<ConversationMessageResponse> {
    this.add({
      role: "user",
      content: userMessage,
    });

    return this.#generateCompletion();
  }

  async executeToolCall(accept: boolean): Promise<ConversationMessageResponse> {
    if (!this.#pendingToolCall) {
      throw new Error("No pending tool call");
    }

    const projectRoot = settingsStore.get("projectDirectory");
    if (!projectRoot) {
      throw new Error("Project directory not set in settings");
    }

    this.add({
      role: "tool",
      name: this.#pendingToolCall.function.name,
      content: accept
        ? await toolMap[this.#pendingToolCall.function.name]({
            projectRoot,
            ...this.#getPendingToolCallArguments(),
          })
        : "This tool call was successfully processed, but the user rejected executing it, so you cannot access the result. You may acknowledge that the user rejected the previous tool call and ask if they want to re-try it or do something else.",
      toolCallId: this.#pendingToolCall.id,
    });

    return this.#generateCompletion();
  }
}
