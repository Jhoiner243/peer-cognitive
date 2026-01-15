"use client";

import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools
} from "@/components/ai-elements/prompt-input";
import { useMessages } from "@/contexts/MessagesContext";
import { useAIStream } from "@/hooks/use-ai-stream";
import { useEffect, useState } from "react";

export const models = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    chef: "OpenAI",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    chef: "OpenAI",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    id: "claude-opus-4-20250514",
    name: "Claude 4 Opus",
    chef: "Anthropic",
    chefSlug: "anthropic",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet",
    chef: "Anthropic",
    chefSlug: "anthropic",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    chef: "Google",
    chefSlug: "google",
    providers: ["google"],
  },
];

export const TextAreaPrompts = () => {

  const { addMessage } = useMessages();
  const { generate, streaming } = useAIStream();
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");



  // Sync status with streaming
  useEffect(() => {
    if (streaming) {
      setStatus("streaming");
    } else if (status === "streaming") {
      setStatus("ready");
    }
  }, [streaming, status]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments) || streaming) {
      return;
    }

    setStatus("submitted");

    // Add user message to global state
    addMessage({ role: 'user', content: message.text || "" });

    // Trigger generation
    generate(message.text || "");

    // The status transition to "streaming" will be handled by the useEffect above
    // or we can set it here if desired, but AI stream starts soon.
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg">
      <PromptInputProvider>
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} key={attachment.id} />}
          </PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea 
              placeholder="Ask anything about the knowledge graph..." 
              className="min-h-[10px] max-h-[100px] border-0 bg-transparent resize-none"
            />
          </PromptInputBody>
          <PromptInputFooter >
            <PromptInputTools>
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    </div>
  );
};