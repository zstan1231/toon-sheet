// Hook for AI generation using Anthropic SDK and OpenAI for images
import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import Anthropic from '@anthropic-ai/sdk';
import type { Character, EquippedItem } from '../types/character';

interface AIState {
  isGenerating: boolean;
  error: string | null;
}

const ANTHROPIC_KEY_STORE = 'anthropic_api_key';
const OPENAI_KEY_STORE = 'openai_api_key';

export async function getAnthropicKey(): Promise<string | null> {
  return SecureStore.getItemAsync(ANTHROPIC_KEY_STORE);
}

export async function getOpenAIKey(): Promise<string | null> {
  return SecureStore.getItemAsync(OPENAI_KEY_STORE);
}

export async function saveAnthropicKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(ANTHROPIC_KEY_STORE, key);
}

export async function saveOpenAIKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(OPENAI_KEY_STORE, key);
}

export function useAIGeneration() {
  const [state, setState] = useState<AIState>({
    isGenerating: false,
    error: null,
  });

  const generateItemDescription = useCallback(
    async (itemName: string, category: string): Promise<string> => {
      const apiKey = await getAnthropicKey();
      if (!apiKey) throw new Error('Anthropic API key not configured. Go to Settings to add your key.');

      setState({ isGenerating: true, error: null });
      try {
        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 256,
          messages: [
            {
              role: 'user',
              content: `Write a brief, evocative description for a D&D 3.5e ${category.toLowerCase()} item called "${itemName}". Keep it to 2-3 sentences in the style of a D&D sourcebook entry. Focus on appearance and lore.`,
            },
          ],
        });
        const text = message.content[0]?.type === 'text' ? message.content[0].text : '';
        setState({ isGenerating: false, error: null });
        return text;
      } catch (e) {
        const error = String(e);
        setState({ isGenerating: false, error });
        throw e;
      }
    },
    [],
  );

  const parseVoiceInput = useCallback(
    async (rawText: string): Promise<{
      name: string;
      quantity: number;
      weight: number;
      category: string;
      description: string;
    }> => {
      const apiKey = await getAnthropicKey();
      if (!apiKey) throw new Error('Anthropic API key not configured.');

      setState({ isGenerating: true, error: null });
      try {
        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 512,
          messages: [
            {
              role: 'user',
              content: `Parse this spoken item description for a D&D 3.5e inventory system: "${rawText}"

Return a JSON object with these fields:
- name: string (item name)
- quantity: number (default 1)
- weight: number (estimated weight in lbs, 0 if unknown)
- category: one of "Weapons", "Armor", "Potions", "Scrolls", "Wondrous Items", "Mundane Gear", "Other"
- description: string (brief item description)

Return only the JSON object, no other text.`,
            },
          ],
        });

        const text = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
        const parsed = JSON.parse(text);
        setState({ isGenerating: false, error: null });
        return {
          name: parsed.name ?? rawText,
          quantity: parsed.quantity ?? 1,
          weight: parsed.weight ?? 0,
          category: parsed.category ?? 'Other',
          description: parsed.description ?? '',
        };
      } catch (e) {
        const error = String(e);
        setState({ isGenerating: false, error });
        throw e;
      }
    },
    [],
  );

  const generateCharacterPortraitPrompt = useCallback(
    (character: Character, equipment: EquippedItem[]): string => {
      const equippedItems = equipment
        .filter(e => e.itemName)
        .map(e => `${e.slot}: ${e.itemName}`)
        .join(', ');

      return `A D&D 3.5 edition fantasy illustration of a ${character.race} ${character.characterClass}, level ${character.level}. ${character.gender ? `Gender: ${character.gender}.` : ''} ${character.age ? `Age: ${character.age}.` : ''} ${character.eyes ? `Eyes: ${character.eyes}.` : ''} ${character.hair ? `Hair: ${character.hair}.` : ''} ${character.skin ? `Skin: ${character.skin}.` : ''} ${equippedItems ? `Wearing/carrying: ${equippedItems}.` : ''} Full body portrait, in the style of D&D 3.5 edition fantasy illustration, detailed pen and ink with watercolor, Wayne Reynolds style, high fantasy, dramatic lighting, parchment background.`;
    },
    [],
  );

  const generateEquipmentArtworkPrompt = useCallback(
    (
      itemName: string,
      itemDescription: string,
      slot: string,
      character: Character,
    ): string => {
      return `A D&D 3.5 edition pen-and-ink illustration with watercolor of "${itemName}" (${slot} slot item) ${itemDescription ? `— ${itemDescription}` : ''}. Suitable for a ${character.race} ${character.characterClass}. Detailed fantasy equipment illustration, Wayne Reynolds style, white background, single item portrait.`;
    },
    [],
  );

  const generateImageWithOpenAI = useCallback(
    async (prompt: string): Promise<string> => {
      const apiKey = await getOpenAIKey();
      if (!apiKey) throw new Error('OpenAI API key not configured. Go to Settings to add your key.');

      setState({ isGenerating: true, error: null });
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
        }

        const data = (await response.json()) as { data: Array<{ url: string }> };
        const url = data.data[0]?.url;
        if (!url) throw new Error('No image URL returned from OpenAI');

        setState({ isGenerating: false, error: null });
        return url;
      } catch (e) {
        const error = String(e);
        setState({ isGenerating: false, error });
        throw e;
      }
    },
    [],
  );

  const askRulesQuestion = useCallback(
    async (
      question: string,
      conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    ): Promise<string> => {
      const apiKey = await getAnthropicKey();
      if (!apiKey) throw new Error('Anthropic API key not configured. Go to Settings to add your key.');

      setState({ isGenerating: true, error: null });
      try {
        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          system: `You are a D&D 3.5 edition rules expert. Answer questions about the rules accurately based on the Player's Handbook, Dungeon Master's Guide, and other official 3.5e sourcebooks. Be concise but thorough. If a ruling is ambiguous, explain the most common interpretation and any relevant errata. Format your responses clearly with proper D&D terminology.`,
          messages: [
            ...conversationHistory.map(h => ({
              role: h.role as 'user' | 'assistant',
              content: h.content,
            })),
            { role: 'user', content: question },
          ],
        });
        const text = message.content[0]?.type === 'text' ? message.content[0].text : '';
        setState({ isGenerating: false, error: null });
        return text;
      } catch (e) {
        const error = String(e);
        setState({ isGenerating: false, error });
        throw e;
      }
    },
    [],
  );

  return {
    isGenerating: state.isGenerating,
    error: state.error,
    generateItemDescription,
    parseVoiceInput,
    generateCharacterPortraitPrompt,
    generateEquipmentArtworkPrompt,
    generateImageWithOpenAI,
    askRulesQuestion,
  };
}
