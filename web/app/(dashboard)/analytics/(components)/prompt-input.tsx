"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { EXAMPLE_PROMPTS } from "../analytics.constants";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

function validatePrompt(prompt: string): string | null {
  const nonWhitespace = prompt.replace(/\s/g, "");
  if (nonWhitespace.length === 0) {
    return "Veuillez saisir une question non vide.";
  }
  if (nonWhitespace.length < 5) {
    return "La question doit contenir au moins 5 caractères (hors espaces).";
  }
  return null;
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validatePrompt(prompt);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSubmit(prompt);
  }

  function handleExampleClick(example: string) {
    setPrompt(example);
    setError(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value);
    if (error) setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Textarea
          value={prompt}
          onChange={handleChange}
          placeholder="Posez une question sur les données de pollution ou les scores RSE…"
          disabled={isLoading}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "prompt-error" : undefined}
          className="min-h-28"
        />
        {error && (
          <p id="prompt-error" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            Analyse en cours…
          </>
        ) : (
          "Analyze"
        )}
      </Button>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">Exemples de questions :</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.slice(0, 5).map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
