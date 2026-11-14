import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import { Event } from '@/services/event.service';
import { getImageUrl } from '@/utils/image';
import { homeStyles as s, GRAY } from '@/constants/home-styles';

interface Props {
  event: Event;
}

export default function UpcomingCard({ event }: Props) {
  const imgUrl = getImageUrl(event.poster);

  return (
    <TouchableOpacity
      style={s.upcomingCard}
      activeOpacity={0.88}
      onPress={() => router.push(`/event/${event.id}` as any)}
    >
      <Image
        source={imgUrl ? { uri: imgUrl } : require('@/assets/images/splash-icon.png')}
        style={s.upcomingImg}
        contentFit="cover"
      />
      <View style={s.upcomingInfo}>
        <Text style={s.upcomingTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={s.upcomingArtist} numberOfLines={1}>
          {event.artist_name ?? ''} · {dayjs(event.event_date).format('MMM D, YYYY')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={GRAY} />
    </TouchableOpacity>
  );
}
