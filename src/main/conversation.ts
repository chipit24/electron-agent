import { Mistral } from "@mistralai/mistralai";
import type { ChatCompletionStreamRequestMessages } from "@mistralai/mistralai/models/components";
import coderSystemPrompt from "./coderSystemPrompt.txt?raw";
import { toolMap, tools } from "./tools/llmTools";

export class Conversation {
  static model = "devstral-small-latest" as const;

  #client;
  #messages: ChatCompletionStreamRequestMessages[] = [
    { role: "system", content: coderSystemPrompt },
  ];

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
  }

  async sendMessage(userMessage: string) {
    this.add({
      role: "user",
      content: userMessage,
    });

    const chatResponse = await this.generateCompletion();

    const message = chatResponse.choices[0]?.message;
    this.add({ ...message, role: "assistant" });

    const toolCall = message?.toolCalls?.[0];
    if (!toolCall) {
      return {
        content: message.content,
        usage: chatResponse.usage,
      };
    }

    /* TODO: Prompt the user to either accept or reject tool call */

    this.add({
      role: "tool",
      content: await toolMap[toolCall.function.name](),
      toolCallId: toolCall.id,
      name: toolCall.function.name,
    });

    const toolResponse = await this.generateCompletion();

    const toolMessage = toolResponse.choices[0]?.message;
    if (toolMessage) {
      this.add({ ...toolMessage, role: "assistant" });
    }

    return {
      content: toolMessage?.content,
      usage: toolResponse.usage,
    };
  }
}
