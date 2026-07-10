// src/screens/CreatePostScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

const PLATFORMS = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'TWITTER'] as const;
const MOODS = ['professional', 'casual', 'inspirational', 'humorous', 'educational'] as const;

export default function CreatePostScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [mood, setMood] = useState<string>(MOODS[0]);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!token || !topic.trim()) {
      Alert.alert('Missing info', 'Please enter a topic.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.generatePost(token, topic.trim(), mood, platform);
      Alert.alert(
        'Post Generated!',
        `Score: ${res.post.omegaScore}\n\n${res.post.content.slice(0, 120)}...`,
        [{ text: 'Go to Dashboard', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Generation failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create New Post</Text>

      <Text style={styles.label}>Topic</Text>
      <TextInput
        style={styles.input}
        placeholder="What should the post be about?"
        placeholderTextColor="#64748b"
        value={topic}
        onChangeText={setTopic}
        multiline
      />

      <Text style={styles.label}>Platform</Text>
      <View style={styles.chipRow}>
        {PLATFORMS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, platform === p && styles.chipActive]}
            onPress={() => setPlatform(p)}
          >
            <Text style={[styles.chipText, platform === p && styles.chipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Mood</Text>
      <View style={styles.chipRow}>
        {MOODS.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, mood === m && styles.chipActive]}
            onPress={() => setMood(m)}
          >
            <Text style={[styles.chipText, mood === m && styles.chipTextActive]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGenerate} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Generate Post ✨</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '800', color: '#f8fafc', marginBottom: 24 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#1a1a3e', color: '#f8fafc', padding: 14,
    borderRadius: 8, minHeight: 80, textAlignVertical: 'top',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1a1a3e', borderWidth: 1, borderColor: '#2a2a5e',
  },
  chipActive: { backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' },
  chipText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  button: {
    backgroundColor: '#6c5ce7', padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 32,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
