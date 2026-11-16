import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  type ScrollViewInstance,
} from 'react-native';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import { Event } from '@/services/event.service';
import { getImageUrl } from '@/utils/image';
import { homeStyles as s, FEATURED_W, YELLOW } from '@/constants/home-styles';

interface Props {
  events: Event[];
  activeIndex: number;
  onIndexChange: (idx: number) => void;
}

export default function FeaturedBanner({ events, activeIndex, onIndexChange }: Props) {
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (events.length < 2) return;
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % events.length;
      scrollRef.current?.scrollTo({ x: nextIndex * FEATURED_W, animated: true });
      onIndexChange(nextIndex);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeIndex, events.length, onIndexChange]);

  if (events.length === 0) return null;

  return (
    <View style={s.bannerWrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / FEATURED_W);
          onIndexChange(idx);
        }}
      >
        {events.map((event) => {
          const imgUrl = getImageUrl(event.poster);
          const cats = event.ticket_categories ?? [];
          const minPrice =
            event.min_price != null && Number(event.min_price) > 0
              ? Number(event.min_price)
              : cats.length > 0
              ? cats.reduce((m, c) => Math.min(m, Number(c.price)), Number(cats[0].price))
              : null;

          return (
            <TouchableOpacity
              key={event.id}
              activeOpacity={0.93}
              onPress={() => router.push(`/event/${event.id}` as any)}
            >
              <ImageBackground
                source={
                  imgUrl
                    ? { uri: imgUrl }
                    : require('@/assets/images/splash-icon.png')
                }
                style={s.bannerBg}
                imageStyle={local.bannerImageStyle}
              >
                {/* dark gradient overlay from bottom */}
                <View style={local.gradientOverlay} />

                {/* FEATURED badge top-left */}
                <View style={s.featuredBadge}>
                  <Text style={s.featuredBadgeText}>✦ FEATURED</Text>
                </View>

                {/* Content bottom */}
                <View style={s.bannerContent}>
                  <Text style={s.bannerTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={s.bannerSub} numberOfLines={1}>
                    🎤 {event.artist_name ?? ''}  ·  📅 {dayjs(event.event_date).format('D MMM YYYY')}
                  </Text>
                  {event.venue ? (
                    <Text style={[s.bannerSub, { marginTop: 2 }]} numberOfLines={1}>
                      📍 {event.venue}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 }}>
                    <View style={s.bannerBtn}>
                      <Text style={s.bannerBtnText}>Pesan Tiket</Text>
                    </View>
                    {minPrice != null && (
                      <Text style={{ color: YELLOW, fontSize: 13, fontWeight: '700' }}>
                        from Rp{minPrice.toLocaleString('id-ID')}
                      </Text>
                    )}
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Dots */}
      <View style={s.dotsRow}>
        {events.map((_, i) => (
          <View key={i} style={[s.dot, i === activeIndex && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  bannerImageStyle: {
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    // Simulasi gradient: transparan di atas, gelap di bawah
    backgroundColor: 'transparent',
    // Gunakan beberapa layer View untuk efek gradient manual
  },
});
