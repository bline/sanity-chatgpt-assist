import { BoxProps } from "@sanity/ui";
import React from "react";
import { PortableTextBlock, SanityClient } from "sanity";

export interface ChatGPTAssistSupportedFields {
  documentType: string;
  fieldKey: string
}

export interface ChatGPTPrompt {
  _id: string;
  name: string;
  text: string;
}

export interface ChatGPTPromptGroup {
  _id: string;
  name: string;
  exclusive: boolean;
  weight: number;
  prompts: ChatGPTPrompt[];
}

export type ApiKey = string | ((client: SanityClient) => Promise<string>);

export interface ChatGPTAssistConfig {
  apiKey?: ApiKey;
  apiUrl?: string;
  supportedFields: ChatGPTAssistSupportedFields[];/*
    { documentType: '*', fieldKey: 'body' }, // Generic support for any document with a 'content' field
    { documentType: 'blogPost', fieldKey: 'body' }, // Specific support for 'body' field in 'blogPost'
  ]*/
}

export type ChatGPTAPIMessage = {
  role: 'user' | 'assistant' | 'developer';
  content: any;
}

export interface ChatGPTMessage {
  _key: string;
  role: 'user' | 'assistant' | 'developer';
  content: any;
  timestamp: string; // ISO 8601 string
}

export interface ChatGPTHistory {
  _id: string;
  documentRef: { _ref: string; _type: string; _weak: true };
  fieldKey: string;
  messages: ChatGPTMessage[];
  promptRefs: { _ref: string; _type: string }[];
}

export interface GenerateContentOptions {
  apiKey?: ApiKey;
  apiUrl?: string;
  portableText?: PortableTextBlock[]|null;
  prompt?: string|null;
  client: SanityClient;
  chatHistory?: ChatGPTHistory|null;
  promptGroups: ChatGPTPromptGroup[];
}

export interface ChatHistoryProps {
}

export interface UserPromptProps {
  value?: PortableTextBlock[];
  apiKey?: ApiKey;
  apiUrl?: string;
  onChange: (portableText: PortableTextBlock[]) => void; 
}

export type PromptDataProviderProps = React.PropsWithChildren<{
  documentId: string;
  documentType: string;
  fieldKey: string;
  client: SanityClient;
}>

export type PropDataStateContext = {
  chatHistory: ChatGPTHistory|null;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatGPTHistory|null>>;
  promptGroups: ChatGPTPromptGroup[];
  setPromptGroups: React.Dispatch<React.SetStateAction<ChatGPTPromptGroup[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string|null;
  setError: React.Dispatch<React.SetStateAction<string|null>>;
};

export type ChatBoxProps = BoxProps & React.PropsWithChildren<{
  colors: Array<string>;
}>;