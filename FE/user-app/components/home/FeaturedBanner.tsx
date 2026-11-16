import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import { Event } from '@/services/event.service';
import { getImageUrl } from '@/utils/image';
import { homeStyles as s, FEATURED_W } from '@/constants/home-styles';

interface Props {
  events: Event[];
  activeIndex: number;
  onIndexChange: (idx: number) => void;
}

export default function FeaturedBanner({ events, activeIndex, onIndexChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);

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
          return (
            <TouchableOpacity
              key={event.id}
              activeOpacity={0.92}
              onPress={() => router.push(`/event/${event.id}` as any)}
            >
              <ImageBackground
                source={imgUrl ? { uri: imgUrl } : require('@/assets/images/splash-icon.png')}
                style={s.bannerBg}
                imageStyle={s.bannerImage}
              >
                <View style={s.bannerOverlay} />
                <View style={s.featuredBadge}>
                  <Text style={s.featuredBadgeText}>FEATURED</Text>
                </View>
                <View style={s.bannerContent}>
                  <Text style={s.bannerTitle} numberOfLines={1}>{event.title}</Text>
                  <Text style={s.bannerSub} numberOfLines={1}>
                    {dayjs(event.event_date).format('MMM D')} · {event.venue}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Dots indicator */}
      <View style={s.dotsRow}>
        {events.map((_, i) => (
          <View key={i} style={[s.dot, i === activeIndex && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}
