import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { TrendingUp, ClipboardList, Plus, AlertCircle, Clock, Utensils, Package, ChevronRight, Activity, CheckCircle2, Bell, Leaf } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { AnimatedButton, FadeInView } from '@/components/AnimatedWrappers';
import { 
  getDashboardActiveMenuCount, 
  getInventoryHealthStats, 
  getLowStockItems 
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

function PulseIndicator({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pulseContainer}>
      <Animated.View 
        style={[
          styles.pulseCircle, 
          { 
            backgroundColor: color,
            opacity: opacity,
            transform: [{ scale: scale }]
          }
        ]} 
      />
      <View style={[styles.pulseDot, { backgroundColor: color }]} />
    </View>
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

function StatusChip({ text, type }: { text: string; type: 'low' | 'restock' | 'critical' | 'healthy' }) {
  const bgColor = {
    low: 'rgba(212, 163, 115, 0.2)',
    restock: 'rgba(212, 163, 115, 0.1)',
    critical: 'rgba(220, 38, 38, 0.2)',
    healthy: 'rgba(22, 163, 74, 0.2)',
  }[type];
  
  const textColor = {
    low: SOFT_SAND,
    restock: SOFT_SAND,
    critical: '#FF6B6B',
    healthy: '#4ADE80',
  }[type];
  
  return (
    <View style={[styles.statusChip, { backgroundColor: bgColor }]}>
      <Text style={[styles.statusChipText, Typography.label, { color: textColor }]}>{text}</Text>
    </View>
  );
}

function InventoryStatusCard({ 
  status, 
  item, 
  type 
}: { 
  status: string; 
  item: string; 
  type: 'low' | 'restock' | 'critical' | 'healthy' 
}) {
  const showPulse = type === 'critical';
  
  return (
    <View style={styles.inventoryStatusCard}>
      <View style={styles.inventoryStatusContent}>
        <View style={styles.statusWithIcon}>
          {showPulse ? (
            <PulseIndicator color="#FF6B6B" />
          ) : (
            <View style={[styles.staticDot, { backgroundColor: type === 'restock' ? Colors.accent : '#4ADE80' }]} />
          )}
          <StatusChip text={status} type={type} />
        </View>
        <Text style={[styles.inventoryItemName, Typography.bodyText]}>{item}</Text>
      </View>
      <ChevronRight size={14} color={IVORY} opacity={0.2} />
    </View>
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

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  
  const [stats, setStats] = useState({
    activeMenus: 0,
    healthPercent: 100,
    lowStockCount: 0,
    totalIngredients: 0,
    alerts: [] as any[]
  });

  useFocusEffect(
    useCallback(() => {
      const activeCount = getDashboardActiveMenuCount();
      const health = getInventoryHealthStats();
      const items = getLowStockItems();

      setStats({
        activeMenus: activeCount,
        healthPercent: health.percent,
        lowStockCount: health.low,
        totalIngredients: health.total,
        alerts: items
      });
    }, [])
  );

  const inventoryInsights = [
    `${stats.lowStockCount} items need attention`,
    `Health: ${stats.healthPercent}% stable`,
    `${stats.totalIngredients} ingredients tracked`,
  ];

  const opacity1 = useRef(new Animated.Value(0)).current;
  const translateY1 = useRef(new Animated.Value(12)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const translateY2 = useRef(new Animated.Value(12)).current;

  const ringOpacity = useRef(new Animated.Value(1)).current;

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringOpacity, {
          toValue: 0.85,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();
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
        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
          <Bell size={20} color={Colors.accent} />
          <View style={styles.notificationDot} />
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
            <Activity size={12} color={Colors.accent} />
          </View>
          
          <View style={styles.healthMonitorPanel}>
            {/* Health Score Overview */}
            <View style={styles.healthScoreRow}>
              <View style={styles.healthScoreContainer}>
                <Animated.View style={[styles.healthScoreCircle, { opacity: ringOpacity }]} />
                <View style={styles.healthScoreTextOverlay}>
                  <Text style={[styles.healthScorePercent, Typography.heading]}>{stats.healthPercent}%</Text>
                  <Text style={[styles.healthScoreLabel, Typography.label]}>HEALTHY</Text>
                </View>
              </View>
              
              <View style={styles.healthScoreMeta}>
                <RotatingInsight 
                  insights={inventoryInsights} 
                  textStyle={styles.inventoryInsightText}
                />
                <View style={styles.metaSecondaryRow}>
                  <CheckCircle2 size={12} color="#4ADE80" opacity={0.8} />
                  <Text style={[styles.metaSecondaryText, Typography.bodyText]}>{stats.totalIngredients - stats.lowStockCount} items stable</Text>
                </View>
              </View>
            </View>

            <View style={styles.healthDivider} />

            {/* Operational Status Cards */}
            <FadeInView style={styles.statusContainer}>
              {stats.alerts.length === 0 ? (
                <Text style={{ color: IVORY, opacity: 0.3, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 }}>
                  All systems stable.
                </Text>
              ) : (
                stats.alerts.map((alert, idx) => (
                  <InventoryStatusCard 
                    key={idx}
                    status={alert.status} 
                    item={alert.name} 
                    type={alert.type} 
                  />
                ))
              )}
            </FadeInView>
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
        >
          <Plus size={20} color="white" />
          <Text style={[Typography.buttonText, styles.actionButtonText]}>New Operation</Text>
        </AnimatedButton>
      </ScrollView>
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
  healthDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 163, 115, 0.05)',
    marginVertical: 20,
  },
  statusContainer: {
    gap: 12,
  },
  inventoryStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.05)',
  },
  inventoryStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pulseContainer: {
    width: 6,
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  staticDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 1,
  },
  inventoryItemName: {
    fontSize: 14,
    color: IVORY,
    fontWeight: '500',
    opacity: 0.9,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  statusChipText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
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
});
