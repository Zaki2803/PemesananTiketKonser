import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { eventService, Event } from '@/services/event.service';
import { homeStyles as s, BG, YELLOW, GRAY } from '@/constants/home-styles';
import AvatarInitial from '@/components/avatar-initial';
import FeaturedBanner from '@/components/home/FeaturedBanner';
import EventCard from '@/components/home/EventCard';
import UpcomingCard from '@/components/home/UpcomingCard';

const CATEGORIES = ['All', 'Pop', 'Classical', 'Jazz', 'Rock', 'Heavy Metal'];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await eventService.getEvents();
      const data = res?.data || res?.events || res || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log('Fetch events error:', err?.response?.data || err?.message);
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const onRefresh = () => { setRefreshing(true); fetchEvents(); };

  const firstName = user?.name?.split(' ')[0] ?? 'User';

  const filteredEvents = events.filter((e) => {
    const matchCat =
      activeCategory === 'All' ||
      e.genre?.toLowerCase().includes(activeCategory.toLowerCase());
    const matchSearch =
      !search ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.artist_name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredEvents = filteredEvents.slice(0, 5);
  const upcomingEvents = filteredEvents.filter(
    (e) => e.status === 'active' || e.status === 'open'
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={YELLOW} />
        }
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>
              Hi, {firstName} <Text style={s.wave}>👋</Text>
            </Text>
            <Text style={s.greetingSubtitle}>Find your next concert experience</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile' as any)}>
            <AvatarInitial name={user?.name ?? 'U'} size={44} fontSize={17} />
          </TouchableOpacity>
        </View>

        {/* ── Search ── */}
        <View style={s.searchContainer}>
          <Ionicons name="search" size={18} color={GRAY} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Cari konser, artis..."
            placeholderTextColor={GRAY}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={GRAY} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Featured Banner ── */}
        {loading ? (
          <View style={s.bannerLoading}>
            <ActivityIndicator color={YELLOW} size="large" />
          </View>
        ) : (
          <FeaturedBanner
            events={featuredEvents}
            activeIndex={featuredIndex}
            onIndexChange={setFeaturedIndex}
          />
        )}

        {/* ── Category Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoriesContent}
          style={s.categories}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[s.catBtn, activeCategory === cat && s.catBtnActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[s.catText, activeCategory === cat && s.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Featured Events ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Featured Events</Text>
          <TouchableOpacity onPress={() => router.push('/explore' as any)}>
            <Text style={s.seeAll}>Lihat semua →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={YELLOW} style={{ marginVertical: 20 }} />
        ) : filteredEvents.length === 0 ? (
          <Text style={[s.emptyText, { paddingHorizontal: 20 }]}>
            Tidak ada event ditemukan
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.featuredListContent}
          >
            {filteredEvents.slice(0, 8).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ScrollView>
        )}

        {/* ── Upcoming ── */}
        {upcomingEvents.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Upcoming</Text>
            </View>
            {upcomingEvents.slice(0, 6).map((event) => (
              <UpcomingCard key={event.id} event={event} />
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
