import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarInitialProps {
  name: string;
  size?: number;
  fontSize?: number;
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Warna konsisten berdasarkan nama, bukan random setiap render
function getAvatarColor(name: string): string {
  const colors = [
    '#F5C518', '#E8834A', '#5B8DEF', '#52C77A',
    '#E85B8A', '#9B6EEB', '#38BDF8', '#FB923C',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function AvatarInitial({ name, size = 80, fontSize = 32 }: AvatarInitialProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const borderRadius = size * 0.22;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius, backgroundColor: bgColor }]}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#1a1a2e', fontWeight: '700' },
});
