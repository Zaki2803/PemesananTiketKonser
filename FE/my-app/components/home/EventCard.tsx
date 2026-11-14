import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Event } from '@/services/event.service';
import { getImageUrl } from '@/utils/image';
import { homeStyles as s } from '@/constants/home-styles';

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const imgUrl = getImageUrl(event.poster);
  const cats = event.ticket_categories ?? [];

  // Prioritas min_price dari backend, fallback dari ticket_categories
  const minPrice = event.min_price != null && Number(event.min_price) > 0
    ? Number(event.min_price)
    : cats.length > 0
      ? cats.reduce((min, c) => Math.min(min, Number(c.price)), Number(cats[0].price))
      : null;

  const available = cats.reduce((sum, c) => sum + (c.available ?? c.quota), 0);

  return (
    <TouchableOpacity
      style={s.eventCard}
      activeOpacity={0.88}
      onPress={() => router.push(`/event/${event.id}` as any)}
    >
      <View style={s.eventCardImg}>
        <Image
          source={imgUrl ? { uri: imgUrl } : require('@/assets/images/splash-icon.png')}
          style={s.eventCardImgFill}
          contentFit="cover"
        />
        {event.genre ? (
          <View style={s.genreBadge}>
            <Text style={s.genreText}>{event.genre}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={s.heartBtn}>
          <Ionicons name="heart-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={s.eventCardBody}>
        <Text style={s.eventCardTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={s.eventCardArtist} numberOfLines={1}>{event.artist_name ?? ''}</Text>
        <View style={s.eventCardFooter}>
          <Text style={s.eventCardPrice}>
            {minPrice != null
              ? `from Rp${minPrice.toLocaleString('id-ID')}`
              : 'Lihat harga'}
          </Text>
          {available > 0 && (
            <Text style={s.eventCardQuota}>{available} left</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
