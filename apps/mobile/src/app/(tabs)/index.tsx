import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { TrendingUp, ClipboardList, Plus, AlertCircle, Clock, Utensils, Package, ChevronRight, Activity, CheckCircle2, Bell, Leaf, X, Info, Settings as SettingsIcon, AlertTriangle } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { AnimatedButton, FadeInView } from '@/components/AnimatedWrappers';
import { 
  getDashboardActiveMenuCount, 
  getInventoryHealthStats, 
  getInventoryAlertCounts 
} from '@/utils/database';

const ACTIVE_MENU_INSIGHTS = [
  '+1 This Week',
  'Next Event Saturday',
  '2 Ready For Production',
];

const PRODUCTION_VALUE_INSIGHTS = [
  '+16% This Month',
  'Average Event KSh 31K',
  'Largest Event KSh 52K',
];

const IVORY = '#FDFCFB';
const DARK_FOREST = '#0F1A15';
const DARK_OLIVE = '#1C2620';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';

function CountUpValue({ value, suffix = '', duration = 1000 }: { value: number; suffix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <Text>{displayValue}{suffix}</Text>;
}

const ROTATION_DURATIONS = [5000, 10000, 7000, 12000];

function RotatingInsight({ insights, textStyle }: { insights: string[]; textStyle?: any }) {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const rotate = (currentIndex: number) => {
      if (!isMounted) return;
      
      const nextDuration = ROTATION_DURATIONS[currentIndex % ROTATION_DURATIONS.length];
      
      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          if (!isMounted) return;
          
          const nextIndex = (currentIndex + 1) % insights.length;
          setIndex(nextIndex);

          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            rotate(nextIndex);
          });
        });
      }, nextDuration);
    };

    rotate(0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [insights, fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text style={[Typography.label, textStyle]}>{insights[index]}</Text>
    </Animated.View>
  );
}

function MetricCard({
  title,
  value,
  suffix = '',
  insights,
  animatedStyle,
}: {
  title: string;
  value: number;
  suffix?: string;
  insights: string[];
  animatedStyle?: any;
}) {
  return (
    <Animated.View style={[styles.metricCard, animatedStyle]}>
      <View style={styles.metricAccent} />
      <Text style={[styles.metricLabel, Typography.label]}>{title.toUpperCase()}</Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, Typography.heading]}>
          <CountUpValue value={value} suffix={suffix} />
        </Text>
      </View>
      <View style={styles.trendRow}>
        <TrendingUp size={12} color={Colors.accent} style={styles.trendIcon} />
        <RotatingInsight insights={insights} textStyle={styles.metricTrend} />
      </View>
    </Animated.View>
  );
}

const OPERATIONAL_ACTIVITIES = [
  {
    icon: TrendingUp,
    title: 'Recipe Updated',
    detail: 'Spicy Thai Curry',
    time: '2h ago',
    type: 'recipe'
  },
  {
    icon: Utensils,
    title: 'Menu Finalized',
    detail: 'Wedding Reception',
    time: '4h ago',
    type: 'menu'
  },
  {
    icon: Package,
    title: 'Inventory Audit',
    detail: 'Dry Storage',
    time: 'Yesterday',
    type: 'inventory'
  }
];

const FEED_ROTATION_DURATIONS = [8000, 10000, 12000];

function RotatingOperationalFeed() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const rotate = (currentIndex: number) => {
      if (!isMounted) return;
      
      const nextDuration = FEED_ROTATION_DURATIONS[currentIndex % FEED_ROTATION_DURATIONS.length];
      
      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          if (!isMounted) return;
          
          const nextIndex = (currentIndex + 1) % OPERATIONAL_ACTIVITIES.length;
          setIndex(nextIndex);

          // Fade in
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start(() => {
            rotate(nextIndex);
          });
        });
      }, nextDuration);
    };

    rotate(0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const activity = OPERATIONAL_ACTIVITIES[index];
  
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <ActivityEntry 
        icon={activity.icon}
        title={activity.title}
        detail={activity.detail}
        time={activity.time}
        type={activity.type}
      />
    </Animated.View>
  );
}

function ActivityEntry({ 
  icon: Icon, 
  title, 
  detail, 
  time,
  type 
}: { 
  icon: any; 
  title: string; 
  detail: string; 
  time: string;
  type?: string;
}) {
  const categoryColor = 
    type === 'menu' ? '#4ADE80' : 
    type === 'inventory' ? '#FF6B6B' : 
    '#E9C46A'; // Brighter Gold for Recipe visibility

  const titleColor = type === 'recipe' ? SOFT_SAND : categoryColor;

  return (
    <View style={styles.activityEntry}>
      <View style={[styles.activityIconWrapper, { backgroundColor: `${categoryColor}15` }]}>
        <Icon size={14} color={categoryColor} strokeWidth={2.5} />
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeaderRow}>
          <Text style={[styles.activityTitle, Typography.label, { color: titleColor }]}>{title}</Text>
          <Text style={[styles.activityTime, Typography.label]}>{time}</Text>
        </View>
        <Text style={[styles.activityDetail, Typography.bodyText]}>{detail}</Text>
      </View>
      <ChevronRight size={14} color={IVORY} opacity={0.1} />
    </View>
  );
}

const NOTIFICATIONS = [
  { id: 1, title: 'Welcome to PrepFlow', type: 'info', time: 'Just now' },
  { id: 2, title: 'Inventory system online', type: 'success', time: '2m ago' },
  { id: 3, title: 'New recipe templates added', type: 'info', time: '1h ago' },
  { id: 4, title: 'Menu planner ready', type: 'info', time: '3h ago' },
  { id: 5, title: 'Costing module coming soon', type: 'warning', time: '1d ago' },
];

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    activeMenus: 0,
    totalIngredients: 0,
    criticalCount: 0,
    restockCount: 0,
    totalAlerts: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const activeCount = getDashboardActiveMenuCount();
      const health = getInventoryHealthStats();
      const alerts = getInventoryAlertCounts();

      setStats({
        activeMenus: activeCount,
        totalIngredients: health.total,
        criticalCount: alerts.critical,
        restockCount: alerts.restock,
        totalAlerts: alerts.total,
      });
    }, [])
  );

  const opacity1 = useRef(new Animated.Value(0)).current;
  const translateY1 = useRef(new Animated.Value(12)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const translateY2 = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(opacity1, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY1, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(opacity2, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY2, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Branded Fixed Header - Integrated into Dark Atmosphere */}
      <View style={styles.header}>
        {/* Luxury Leaf Watermark */}
        <View style={styles.headerWatermark}>
          <Leaf size={140} color={Colors.accent} opacity={0.03} strokeWidth={1} />
        </View>

        <View style={styles.brandContainer}>
          <Text style={[Typography.screenTitle, styles.brandTitle]}>KitchenLog</Text>
          <View style={styles.brandDivider} />
          <Text style={[Typography.label, styles.brandSubtitle]}>KITCHEN OPERATIONS HUB</Text>
        </View>

        {/* Notification Bell */}
        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7} onPress={() => setShowNotifications(true)}>
          <Bell size={20} color={Colors.accent} />
          {stats.totalAlerts > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Operations Hub Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Text style={[styles.sectionLabel, Typography.label]}>OPERATIONS OVERVIEW</Text>
          </View>
          <View style={styles.metricsRow}>
            <MetricCard
              title="Active Menus"
              value={stats.activeMenus}
              insights={ACTIVE_MENU_INSIGHTS}
              animatedStyle={{
                opacity: opacity1,
                transform: [{ translateY: translateY1 }],
              }}
            />
            <MetricCard
              title="Production Value"
              value={124}
              suffix="K"
              insights={PRODUCTION_VALUE_INSIGHTS}
              animatedStyle={{
                opacity: opacity2,
                transform: [{ translateY: translateY2 }],
              }}
            />
          </View>
        </View>

        {/* Inventory Health Monitor */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Text style={[styles.sectionLabel, Typography.label]}>INVENTORY HEALTH</Text>
            <View style={styles.headerIconSpacer} />
            <AlertTriangle size={12} color={Colors.accent} />
          </View>
          
          <View style={styles.healthMonitorPanel}>
            {stats.totalIngredients === 0 ? (
              <Text style={{ color: IVORY, opacity: 0.3, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 }}>
                No inventory data
              </Text>
            ) : stats.totalAlerts === 0 ? (
              <View style={styles.alertsEmpty}>
                <CheckCircle2 size={24} color="#4ADE80" />
                <Text style={styles.alertsEmptyText}>All systems stable.</Text>
                <Text style={styles.alertsEmptySub}>{stats.totalIngredients} ingredients tracked</Text>
              </View>
            ) : (
              <>
                <View style={styles.alertsHeader}>
                  <AlertTriangle size={18} color={Colors.accent} />
                  <Text style={styles.alertsTotal}>{stats.totalAlerts}</Text>
                  <Text style={styles.alertsTotalLabel}>Total Alerts</Text>
                </View>

                <View style={styles.alertsBreakdown}>
                  <View style={styles.alertBadge}>
                    <View style={[styles.alertDot, { backgroundColor: '#FF6B6B' }]} />
                    <Text style={styles.alertCount}>{stats.criticalCount}</Text>
                    <Text style={styles.alertLabel}>Critical</Text>
                  </View>
                  <View style={[styles.alertBadge, { marginLeft: 28 }]}>
                    <View style={[styles.alertDot, { backgroundColor: Colors.accent }]} />
                    <Text style={styles.alertCount}>{stats.restockCount}</Text>
                    <Text style={styles.alertLabel}>Restock</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewAlertsBtn}
                  onPress={() => router.push('/inventory-alerts')}
                >
                  <Text style={styles.viewAlertsText}>View Alerts</Text>
                  <ChevronRight size={14} color={DARK_FOREST} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Operational Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Text style={[styles.sectionLabel, Typography.label]}>OPERATIONAL FEED</Text>
            <View style={styles.headerIconSpacer} />
            <Clock size={12} color={IVORY} opacity={0.3} />
          </View>
          <View style={styles.feedContainer}>
            <RotatingOperationalFeed />
          </View>
        </View>

        {/* Primary Action */}
        <AnimatedButton
          style={styles.actionButton}
          onPress={() => router.push('/pos-connect')}
        >
          <Plus size={20} color="white" />
          <Text style={[Typography.buttonText, styles.actionButtonText]}>New Operation</Text>
        </AnimatedButton>
      </ScrollView>

      {/* Notification Panel Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <TouchableOpacity
          style={styles.notifBackdrop}
          activeOpacity={1}
          onPress={() => setShowNotifications(false)}
        >
          <View style={styles.notifPanel}>
            <View style={styles.notifHandle} />
            <View style={styles.notifHeader}>
              <Bell size={16} color={Colors.accent} />
              <Text style={styles.notifHeaderTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={16} color="rgba(253, 252, 251, 0.4)" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notifList} showsVerticalScrollIndicator={false}>
              {NOTIFICATIONS.map((n) => (
                <View key={n.id} style={styles.notifItem}>
                  <View style={styles.notifDot} />
                  <View style={styles.notifContent}>
                    <Text style={styles.notifText}>{n.title}</Text>
                    <Text style={styles.notifTime}>{n.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.notifFooter}>
              <TouchableOpacity
                style={styles.footerLink}
                onPress={() => {
                  setShowNotifications(false);
                  router.push('/settings');
                }}
              >
                <SettingsIcon size={14} color={Colors.accent} />
                <Text style={styles.footerLinkText}>Settings</Text>
              </TouchableOpacity>
              <View style={styles.footerDivider} />
              <TouchableOpacity
                style={styles.footerLink}
                onPress={() => {
                  setShowNotifications(false);
                  router.push('/about');
                }}
              >
                <Info size={14} color={Colors.accent} />
                <Text style={styles.footerLinkText}>About</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_FOREST, 
    flex: 1,
  },
  header: {
    backgroundColor: DARK_FOREST,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerWatermark: {
    position: 'absolute',
    left: -20,
    top: -20,
    transform: [{ rotate: '-15deg' }],
  },
  brandContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  brandTitle: {
    color: IVORY,
    fontSize: 30,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  brandDivider: {
    width: 24,
    height: 1.5,
    backgroundColor: Colors.accent,
    marginVertical: 8,
  },
  brandSubtitle: {
    color: Colors.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 9,
    fontWeight: '700',
    opacity: 0.7,
    textAlign: 'center',
  },
  notificationBtn: {
    position: 'absolute',
    right: 24,
    top: 24,
    zIndex: 2,
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.destructive,
    borderWidth: 1,
    borderColor: DARK_FOREST,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    marginRight: 10,
  },
  sectionLabel: {
    color: SOFT_SAND,
    opacity: 0.8,
    letterSpacing: 1.5,
    fontSize: 10,
    fontWeight: '700',
  },
  headerIconSpacer: {
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  metricAccent: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 2,
    height: 8,
    backgroundColor: Colors.accent,
    opacity: 0.6,
  },
  metricLabel: {
    fontSize: 9,
    color: IVORY,
    opacity: 0.4,
    letterSpacing: 1,
    marginBottom: 10,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 36,
    color: IVORY,
    lineHeight: 40,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    minHeight: 16,
  },
  trendIcon: {
    marginRight: 4,
  },
  metricTrend: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '600',
  },
  healthMonitorPanel: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.1)',
  },
  healthScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  healthScoreContainer: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthScoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    position: 'absolute',
  },
  healthScoreTextOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthScorePercent: {
    fontSize: 20,
    color: IVORY,
    lineHeight: 24,
  },
  healthScoreLabel: {
    fontSize: 8,
    color: '#4ADE80',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  healthScoreMeta: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  inventoryInsightText: {
    fontSize: 14,
    color: IVORY,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaSecondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaSecondaryText: {
    fontSize: 11,
    color: IVORY,
    opacity: 0.4,
  },
  alertsEmpty: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  alertsEmptyText: {
    color: '#4ADE80',
    fontSize: 15,
    fontWeight: '600',
  },
  alertsEmptySub: {
    color: IVORY,
    fontSize: 11,
    opacity: 0.35,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertsTotal: {
    fontSize: 36,
    fontWeight: '700',
    color: IVORY,
  },
  alertsTotalLabel: {
    fontSize: 10,
    color: IVORY,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  alertsBreakdown: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  alertCount: {
    fontSize: 18,
    fontWeight: '700',
    color: IVORY,
  },
  alertLabel: {
    fontSize: 10,
    color: IVORY,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewAlertsBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  viewAlertsText: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_FOREST,
  },
  feedContainer: {
    gap: 12,
  },
  activityEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.05)',
  },
  activityIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 163, 115, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  activityDetail: {
    fontSize: 13,
    color: IVORY,
    opacity: 0.8,
  },
  activityTime: {
    fontSize: 9,
    color: IVORY,
    opacity: 0.3,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  notifBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
  },
  notifPanel: {
    backgroundColor: '#1C2620',
    marginTop: 100,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.15)',
    maxHeight: 420,
    overflow: 'hidden',
  },
  notifHandle: {
    width: 32,
    height: 3,
    backgroundColor: 'rgba(212, 163, 115, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.08)',
  },
  notifHeaderTitle: {
    flex: 1,
    color: IVORY,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },
  notifList: {
    maxHeight: 240,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.05)',
  },
  notifDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginRight: 12,
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
  },
  notifText: {
    color: IVORY,
    fontSize: 13,
    fontWeight: '500',
  },
  notifTime: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.35,
    marginTop: 2,
  },
  notifFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 163, 115, 0.08)',
  },
  footerLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  footerDivider: {
    width: 1,
    backgroundColor: 'rgba(212, 163, 115, 0.08)',
  },
  footerLinkText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});
