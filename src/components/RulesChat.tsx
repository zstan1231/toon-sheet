import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';
import { useAIGeneration } from '../hooks/useAIGeneration';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const SUGGESTED_QUESTIONS = [
  'How does flanking work?',
  'What are the rules for bull rushing?',
  'How do I calculate skill points?',
  'What is the grapple check process?',
  'How do concentration checks work for spellcasters?',
  'What are the rules for attacks of opportunity?',
];

export function RulesChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);
  const { isGenerating, askRulesQuestion } = useAIGeneration();

  const handleSend = useCallback(async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || isGenerating) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const answer = await askRulesQuestion(question, history);

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: answer,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      const errMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${String(e)}. Please check your Anthropic API key in Settings.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    }
  }, [input, messages, isGenerating, askRulesQuestion]);

  const clearChat = () => setMessages([]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📜</Text>
          <Text style={styles.emptyTitle}>D&D 3.5e Rules Assistant</Text>
          <Text style={styles.emptySubtitle}>Ask any rules question powered by Claude AI</Text>

          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>SUGGESTED QUESTIONS</Text>
            {SUGGESTED_QUESTIONS.map(q => (
              <TouchableOpacity
                key={q}
                style={styles.suggestionChip}
                onPress={() => handleSend(q)}
              >
                <Text style={styles.suggestionText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Generating indicator */}
      {isGenerating && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={COLORS.accent} />
          <Text style={styles.typingText}>Consulting the rulebooks...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        {messages.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearChat}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a D&D 3.5e rules question..."
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isGenerating) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim() || isGenerating}
        >
          <Text style={styles.sendBtnText}>▶</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      {!isUser && (
        <Text style={styles.bubbleRole}>⚔ Rules Sage</Text>
      )}
      <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
        {message.content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    width: '100%',
    gap: SPACING.xs,
  },
  suggestionsTitle: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  suggestionChip: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  suggestionText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.text,
  },
  messageList: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    backgroundColor: COLORS.accent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleRole: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bubbleText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  userBubbleText: {
    color: COLORS.white,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.parchmentDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  typingText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.parchmentDark,
    gap: SPACING.sm,
  },
  clearBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.parchmentDeep,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  sendBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
