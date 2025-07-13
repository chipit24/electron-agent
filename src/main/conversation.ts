import { Mistral } from "@mistralai/mistralai";
import type {
  ChatCompletionStreamRequestMessages,
  ToolCall,
  UsageInfo,
} from "@mistralai/mistralai/models/components";
import coderSystemPrompt from "./coderSystemPrompt.txt?raw";
import { toolMap, tools } from "./tools/llmTools";

export type ConversationMessageResponse = {
  content: string;
  usage: UsageInfo;
  toolCall?: { description: string };
};

export class Conversation {
  static model = "devstral-small-latest" as const;

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

  async generateCompletion() {
    const completion = await this.#client.chat.complete({
      model: Conversation.model,
      parallelToolCalls: false,
      tools,
      messages: this.#messages,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("\n<Completion>");
      console.log(JSON.stringify(completion, null, 2));
      console.log("</Completion>");
    }

    return completion;
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
              typeof m.content === "string" && m.content.length > 30
                ? m.content.substring(0, 30) + "..."
                : m.content,
          })),
          null,
          2
        )
      );
      console.log("</Messages>");
    }
  }

  async sendMessage(userMessage: string): Promise<ConversationMessageResponse> {
    this.add({
      role: "user",
      content: userMessage,
    });

    const chatResponse = await this.generateCompletion();

    const message = chatResponse.choices[0]?.message;
    this.add({ ...message, role: "assistant" });

    const toolCall = message.toolCalls?.[0];
    this.#pendingToolCall = toolCall;

    if (process.env.NODE_ENV !== "production") {
      console.log("\n<ToolCall>");
      console.log(JSON.stringify(toolCall, null, 2));
      console.log("</ToolCall>");
    }

    return {
      content: message.content as string,
      usage: chatResponse.usage,
      toolCall: toolCall
        ? {
            description: `${toolCall.function.name}(${toolCall.function.arguments})`,
          }
        : undefined,
    };
  }

  async executeToolCall(accept: boolean): Promise<ConversationMessageResponse> {
    const toolCall = this.#pendingToolCall;
    this.#pendingToolCall = undefined;

    if (!toolCall) {
      throw new Error("No pending tool call");
    }

    this.add({
      role: "tool",
      name: toolCall.function.name,
      content: accept
        ? await toolMap[toolCall.function.name](toolCall.function.arguments)
        : "This tool call was successfully processed, but the user rejected executing it, so you cannot access the result. You may acknowledge that the user rejected the previous tool call and ask if they want to re-try it or do something else.",
      toolCallId: toolCall.id,
    });

    const toolResponse = await this.generateCompletion();
    const toolMessage = toolResponse.choices[0]?.message;
    this.add({ ...toolMessage, role: "assistant" });

    return {
      content: toolMessage.content as string,
      usage: toolResponse.usage,
    };
  }
}
