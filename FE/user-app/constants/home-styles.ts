import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const BG = '#0d1117';
export const CARD = '#111827';
export const CARD2 = '#1c2333';
export const YELLOW = '#F5C518';
export const GRAY = '#6B7280';
export const FEATURED_W = width - 48;

export const homeStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '700' },
  wave: { fontSize: 22 },
  greetingSubtitle: { color: GRAY, fontSize: 13, marginTop: 2 },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 14,
    marginHorizontal: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },

  // Banner
  bannerWrapper: { marginHorizontal: 24, marginBottom: 4 },
  bannerLoading: {
    height: 180,
    marginHorizontal: 24,
    borderRadius: 16,
    backgroundColor: CARD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerBg: {
    width: FEATURED_W,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bannerImage: { borderRadius: 16 },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: YELLOW,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredBadgeText: { color: '#1a1a2e', fontSize: 11, fontWeight: '700' },
  bannerContent: { padding: 16 },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
  dotActive: { backgroundColor: YELLOW, width: 18 },

  // Categories
  categories: { marginBottom: 8 },
  categoriesContent: { paddingHorizontal: 24, gap: 8 },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  catBtnActive: { backgroundColor: YELLOW, borderColor: YELLOW },
  catText: { color: GRAY, fontSize: 13, fontWeight: '500' },
  catTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { color: '#172033', fontSize: 18, fontWeight: '700' },
  seeAll: { color: YELLOW, fontSize: 13, fontWeight: '600' },
  emptyText: { color: GRAY, fontSize: 14, paddingHorizontal: 8, paddingVertical: 20 },

  // Event Card
  featuredListContent: { paddingHorizontal: 24, gap: 14 },
  eventCard: {
    width: 200,
    backgroundColor: CARD2,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  eventCardImg: { width: '100%', height: 130, position: 'relative' },
  eventCardImgFill: { width: '100%', height: '100%' },
  genreBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(245,197,24,0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  genreText: { color: '#1a1a2e', fontSize: 10, fontWeight: '700' },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 6,
  },
  eventCardBody: { padding: 12 },
  eventCardTitle: { color: '#172033', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  eventCardArtist: { color: GRAY, fontSize: 12, marginBottom: 8 },
  eventCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventCardPrice: { color: YELLOW, fontSize: 13, fontWeight: '700' },
  eventCardQuota: { color: GRAY, fontSize: 11 },

  // Upcoming Card
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    marginHorizontal: 24,
    marginBottom: 10,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  upcomingImg: { width: 64, height: 64, borderRadius: 10 },
  upcomingInfo: { flex: 1 },
  upcomingTitle: { color: '#172033', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  upcomingArtist: { color: GRAY, fontSize: 12 },
});
