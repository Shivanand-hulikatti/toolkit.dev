"use client";

import { parsePartialMarkdownCodeBlock } from "@llm-ui/code";

import type { LLMOutputComponent } from "@llm-ui/react";
import type { BundledLanguage } from "@/components/ui/code/shiki.bundle";
import { CodeBlock } from "@/components/ui/code-block";

export const LLMCodeBlock: LLMOutputComponent = ({ blockMatch }) => {
  const { code, language } = parsePartialMarkdownCodeBlock(blockMatch.output);

  if (!code || !language) {
    return null;
  }

  // @llm-ui/code bug: failing to remove trailing backticks
  const cleanedCode = code.replace(/```\s*$/, '').trim();

  return <CodeBlock value={cleanedCode} language={language as BundledLanguage} />;
};
