import type { Mistral } from "@mistralai/mistralai";
import type { ChatCompletionStreamRequestMessages } from "@mistralai/mistralai/models/components";
import coderSystemPrompt from "./coderSystemPrompt.txt?raw";
import { toolMap, tools } from "./tools/llmTools";

export class Conversation {
  #messages: ChatCompletionStreamRequestMessages[] = [
    { role: "system", content: coderSystemPrompt },
  ];

  add(message: ChatCompletionStreamRequestMessages) {
    this.#messages.push(message);
  }

  async sendMessage(client: Mistral, userMessage: string) {
    if (!client) {
      throw new Error("Mistral client not initialized");
    }

    this.add({
      role: "user",
      content: userMessage,
    });

    const chatResponse = await client.chat.complete({
      model: "devstral-small-latest",
      tools,
      messages: this.#messages,
    });

    const message = chatResponse.choices[0]?.message;
    this.add({ ...message, role: "assistant" });

    const toolCall = message?.toolCalls?.[0];
    if (!toolCall) {
      return message.content;
    }

    this.add({
      role: "tool",
      content: await toolMap[toolCall.function.name](),
      toolCallId: toolCall.id,
      name: toolCall.function.name,
    });

    const toolResponse = await client.chat.complete({
      model: "devstral-small-latest",
      messages: this.#messages,
    });

    const toolMessage = toolResponse.choices[0]?.message;
    if (toolMessage) {
      this.add({ ...toolMessage, role: "assistant" });
    }

    return toolMessage?.content;
  }
}
