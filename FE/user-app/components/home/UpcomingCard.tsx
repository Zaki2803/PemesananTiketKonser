import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import { Event } from '@/services/event.service';
import { getImageUrl } from '@/utils/image';
import { homeStyles as s, GRAY, YELLOW } from '@/constants/home-styles';

interface Props {
  event: Event;
}

export default function UpcomingCard({ event }: Props) {
  const imgUrl = getImageUrl(event.poster);
  const dateStr = dayjs(event.event_date).format('ddd, D MMM YYYY');

  return (
    <TouchableOpacity
      style={s.upcomingCard}
      activeOpacity={0.88}
      onPress={() => router.push(`/event/${event.id}` as any)}
    >
      {/* Thumbnail */}
      <View style={local.imgWrapper}>
        <Image
          source={imgUrl ? { uri: imgUrl } : require('@/assets/images/splash-icon.png')}
          style={s.upcomingImg}
          contentFit="cover"
          transition={200}
        />
      </View>

      {/* Info */}
      <View style={s.upcomingInfo}>
        <Text style={s.upcomingTitle} numberOfLines={1}>
          {event.title}
        </Text>
        {event.artist_name ? (
          <Text style={s.upcomingArtist} numberOfLines={1}>
            🎤 {event.artist_name}
          </Text>
        ) : null}
        <Text style={s.upcomingDate}>📅 {dateStr}</Text>
        {event.venue ? (
          <Text style={local.venueText} numberOfLines={1}>
            📍 {event.venue}
          </Text>
        ) : null}
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={18} color={GRAY} />
    </TouchableOpacity>
  );
}

const local = StyleSheet.create({
  imgWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252d3d',
  },
  venueText: {
    color: GRAY,
    fontSize: 11,
    marginTop: 2,
  },
});
