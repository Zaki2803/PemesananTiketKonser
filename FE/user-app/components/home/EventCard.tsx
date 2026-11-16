import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Event } from '@/services/event.service';
import { getImageUrl } from '@/utils/image';
import { homeStyles as s, YELLOW, GRAY } from '@/constants/home-styles';

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const imgUrl = getImageUrl(event.poster);
  const cats = event.ticket_categories ?? [];

  const minPrice =
    event.min_price != null && Number(event.min_price) > 0
      ? Number(event.min_price)
      : cats.length > 0
      ? cats.reduce((min, c) => Math.min(min, Number(c.price)), Number(cats[0].price))
      : null;

  const available = cats.reduce((sum, c) => sum + (c.available ?? c.quota ?? 0), 0);

  return (
    <TouchableOpacity
      style={s.eventCard}
      activeOpacity={0.88}
      onPress={() => router.push(`/event/${event.id}` as any)}
    >
      {/* Image area */}
      <View style={s.eventCardImg}>
        <Image
          source={imgUrl ? { uri: imgUrl } : require('@/assets/images/splash-icon.png')}
          style={s.eventCardImgFill}
          contentFit="cover"
          transition={200}
        />

        {/* Bottom shadow overlay on image */}
        <View style={local.imgShadow} />

        {/* Genre badge bottom-left */}
        {event.genre ? (
          <View style={s.genreBadge}>
            <Text style={s.genreText}>{event.genre.toUpperCase()}</Text>
          </View>
        ) : null}

        {/* Heart button top-right */}
        <TouchableOpacity style={s.heartBtn} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={15} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={s.eventCardBody}>
        <Text style={s.eventCardTitle} numberOfLines={1}>
          {event.title}
        </Text>
        {event.artist_name ? (
          <Text style={s.eventCardArtist} numberOfLines={1}>
            🎤 {event.artist_name}
          </Text>
        ) : null}

        {/* Divider */}
        <View style={local.divider} />

        <View style={s.eventCardFooter}>
          <Text style={s.eventCardPrice} numberOfLines={1}>
            {minPrice != null
              ? `Rp${minPrice.toLocaleString('id-ID')}`
              : 'Lihat harga'}
          </Text>
          {available > 0 ? (
            <View style={local.quotaBadge}>
              <Text style={local.quotaText}>{available} left</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const local = StyleSheet.create({
  imgShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  divider: {
    height: 1,
    backgroundColor: '#252d3d',
    marginVertical: 8,
  },
  quotaBadge: {
    backgroundColor: 'rgba(245,197,24,0.12)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.25)',
  },
  quotaText: {
    color: YELLOW,
    fontSize: 10,
    fontWeight: '700',
  },
});
