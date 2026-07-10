// src/screens/DashboardScreen.tsx
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { token, userId, email, signOut } = useAuth();
  const [posts, setPosts] = useState<api.Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!token || !userId) return;
    try {
      const res = await api.listPosts(token);
      setPosts(res.posts);
    } catch (e) {
      Alert.alert('Error loading posts', (e as Error).message);
    }
  }, [token, userId]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }

  async function handlePublish(postId: string) {
    if (!token) return;
    try {
      const res = await api.publishPost(token, postId);
      Alert.alert(res.success ? 'Published' : 'Failed', res.note ?? res.error ?? '');
      loadPosts();
    } catch (e) {
      Alert.alert('Publish failed', (e as Error).message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{email}</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreatePost')}>
        <Text style={styles.createButtonText}>+ New Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No posts yet — create one above.</Text>}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postPlatform}>{item.platform} · {item.status}</Text>
            <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
            <Text style={styles.postScore}>Omega Score: {item.omegaScore}</Text>
            {item.status !== 'PUBLISHED' && (
              <TouchableOpacity style={styles.publishButton} onPress={() => handlePublish(item.id)}>
                <Text style={styles.publishButtonText}>Publish</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', paddingTop: 60, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerText: { color: '#94a3b8', fontSize: 14 },
  signOut: { color: '#ef4444', fontSize: 14 },
  createButton: { backgroundColor: '#6c5ce7', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  createButtonText: { color: '#fff', fontWeight: '700' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40 },
  postCard: { backgroundColor: '#1a1a3e', padding: 14, borderRadius: 10, marginBottom: 10 },
  postPlatform: { color: '#a855f7', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  postContent: { color: '#f8fafc', marginBottom: 6 },
  postScore: { color: '#10b981', fontSize: 12 },
  publishButton: { backgroundColor: '#06b6d4', padding: 8, borderRadius: 6, marginTop: 8, alignItems: 'center' },
  publishButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
