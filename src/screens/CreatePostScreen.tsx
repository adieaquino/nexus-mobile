// src/screens/CreatePostScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

const PLATFORMS = ['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'FACEBOOK'];
const MOODS = ['motivational', 'emotional', 'humorous', 'professional'];

export default function CreatePostScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('TIKTOK');
  const [mood, setMood] = useState('motivational');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<api.Post | null>(null);

  async function handleGenerate() {
    if (!token || !topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.generatePost(token, topic, mood, platform);
      setResult(res.post);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Post</Text>

      <Text style={styles.label}>Topic</Text>
      <TextInput style={styles.input} placeholder="e.g. morning routines" value={topic} onChangeText={setTopic} />

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
            <Text style={[styles.chipText, mood === m && styles.chipTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={loading || !topic.trim()}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateButtonText}>Generate</Text>}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Generated ({result.omegaScore}/100)</Text>
          <Text style={styles.resultContent}>{result.content}</Text>
          <Text style={styles.resultHashtags}>{result.hashtags.join(' ')}</Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
            <Text style={styles.doneButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', color: '#f8fafc', marginBottom: 24 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1a1a3e', color: '#f8fafc', padding: 14, borderRadius: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#1a1a3e', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#6c5ce7' },
  chipText: { color: '#94a3b8', fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  error: { color: '#ef4444', marginTop: 12 },
  generateButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  generateButtonText: { color: '#fff', fontWeight: '700' },
  resultCard: { backgroundColor: '#1a1a3e', padding: 16, borderRadius: 10, marginTop: 20 },
  resultLabel: { color: '#a855f7', fontWeight: '700', marginBottom: 8 },
  resultContent: { color: '#f8fafc', marginBottom: 8 },
  resultHashtags: { color: '#06b6d4', marginBottom: 12 },
  doneButton: { backgroundColor: '#6c5ce7', padding: 12, borderRadius: 8, alignItems: 'center' },
  doneButtonText: { color: '#fff', fontWeight: '700' },
});
