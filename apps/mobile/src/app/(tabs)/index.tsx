import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { TrendingUp, Plus, Clock, Utensils, Package, ChevronRight, Activity, CheckCircle2, Bell, Leaf, X, Info, Settings as SettingsIcon, DollarSign, BookOpen, Menu as MenuIcon, Grid, BarChart3, RefreshCw, List, ShoppingCart, AlertTriangle } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { FadeInView } from '@/components/AnimatedWrappers';
import { 
  getInventoryHealthStats, 
  getInventoryAlertCounts,
  getRecipes,
  getMenus,
  getInventory,
  getIngredients
} from '@/utils/database';

const IVORY = '#FDFCFB';
const DARK_FOREST = '#0F1A15';
const DARK_OLIVE = '#1C2620';
const SOFT_SAND = 'rgba(212, 163, 115, 0.9)';

function getInventoryValue(): number {
  try {
    const items = getInventory();
    const ingredients = getIngredients();
    const costMap: Record<number, number> = {};
    for (const ing of ingredients) {
      costMap[ing.id] = ing.cost_per_unit;
    }
    let total = 0;
    for (const item of items) {
      const cost = item.ingredient_id ? (costMap[item.ingredient_id] ?? 0) : 0;
      total += item.quantity * cost;
    }
    return Math.round(total);
  } catch {
    return 0;
  }
}

type KpiCardProps = {
  icon: any;
  label: string;
  value: string | number;
  accentColor?: string;
  onPress?: () => void;
};

function KpiCard({ icon: Icon, label, value, accentColor = Colors.accent, onPress }: KpiCardProps) {
  return (
    <TouchableOpacity
      style={[styles.kpiCard, onPress && styles.kpiCardPressable]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.kpiIconWrap, { backgroundColor: `${accentColor}15` }]}>
        <Icon size={16} color={accentColor} />
      </View>
      <Text style={[styles.kpiValue, { color: accentColor }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </TouchableOpacity>
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

function getHealthColor(percent: number): string {
  if (percent >= 90) return '#4ADE80';
  if (percent >= 70) return '#E9C46A';
  if (percent >= 50) return '#FF8C00';
  return '#FF6B6B';
}

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

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          if (!isMounted) return;
          
          const nextIndex = (currentIndex + 1) % OPERATIONAL_ACTIVITIES.length;
          setIndex(nextIndex);

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
    '#E9C46A';

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
  { id: 1, title: 'Welcome to KitchenLog', type: 'info', time: 'Just now' },
  { id: 2, title: 'Inventory system online', type: 'success', time: '2m ago' },
  { id: 3, title: 'New recipe templates added', type: 'info', time: '1h ago' },
  { id: 4, title: 'Menu planner ready', type: 'info', time: '3h ago' },
  { id: 5, title: 'Costing module coming soon', type: 'warning', time: '1d ago' },
];

type ActionItem = {
  icon: any;
  label: string;
  description: string;
  route: string;
  color?: string;
};

const OPS_HUB_ACTIONS: ActionItem[] = [
  { icon: Activity, label: 'POS Connect', description: 'Connect to your point-of-sale system', route: '/pos-connect', color: '#4ADE80' },
  { icon: RefreshCw, label: 'Inventory Sync', description: 'Sync stock levels and audit', route: '/(tabs)/inventory', color: '#4ADE80' },
  { icon: Utensils, label: 'Menu Sync', description: 'Push menu items and pricing', route: '/(tabs)/menus', color: '#E9C46A' },
];

const NEW_OPERATION_ACTIONS: ActionItem[] = [
  { icon: BookOpen, label: 'Create Recipe', description: 'Add a new recipe to your library', route: '/(tabs)/recipes' },
  { icon: MenuIcon, label: 'Create Menu', description: 'Build a new menu from recipes', route: '/(tabs)/menus' },
  { icon: ShoppingCart, label: 'Track Ingredient', description: 'Add ingredient to inventory', route: '/(tabs)/inventory' },
  { icon: Package, label: 'Inventory Count', description: 'Record a physical count', route: '/(tabs)/inventory', color: '#4ADE80' },
  { icon: AlertTriangle, label: 'View Alerts', description: 'Review low stock and critical items', route: '/inventory-alerts', color: '#FF6B6B' },
];

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOpsHub, setShowOpsHub] = useState(false);
  const [showNewOp, setShowNewOp] = useState(false);
  const [stats, setStats] = useState({
    totalIngredients: 0,
    criticalCount: 0,
    restockCount: 0,
    totalAlerts: 0,
    healthPercent: 100,
    itemsNeedAttention: 0,
    itemsStable: 0,
    inventoryValue: 0,
    recipeCount: 0,
    menuCount: 0,
    lowStockCount: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const health = getInventoryHealthStats();
      const alerts = getInventoryAlertCounts();
      const recipes = getRecipes();
      const menus = getMenus();
      const invValue = getInventoryValue();

      setStats({
        totalIngredients: health.total,
        criticalCount: alerts.critical,
        restockCount: alerts.restock,
        totalAlerts: alerts.total,
        healthPercent: health.percent,
        itemsNeedAttention: health.low,
        itemsStable: health.total - health.low,
        inventoryValue: invValue,
        recipeCount: recipes.length,
        menuCount: menus.length,
        lowStockCount: alerts.total,
      });
    }, [])
  );

  const handleOpAction = useCallback((action: ActionItem) => {
    setShowOpsHub(false);
    router.push(action.route as any);
  }, [router]);

  const handleNewAction = useCallback((action: ActionItem) => {
    setShowNewOp(false);
    router.push(action.route as any);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerWatermark}>
          <Leaf size={140} color={Colors.accent} opacity={0.03} strokeWidth={1} />
        </View>

        <View style={styles.brandContainer}>
          <Text style={[Typography.screenTitle, styles.brandTitle]}>KitchenLog</Text>
          <View style={styles.brandDivider} />
          <Text style={[Typography.label, styles.brandSubtitle]}>KITCHEN OPERATIONS HUB</Text>
        </View>

        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7} onPress={() => setShowNotifications(true)}>
          <Bell size={20} color={Colors.accent} />
          {stats.totalAlerts > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Operations Hub Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Text style={[styles.sectionLabel, Typography.label]}>OPERATIONS OVERVIEW</Text>
          </View>
          <View style={styles.kpiGrid}>
            <KpiCard
              icon={DollarSign}
              label="Inventory Value"
              value={`KSh ${stats.inventoryValue.toLocaleString()}`}
              accentColor="#4ADE80"
              onPress={() => router.push('/inventory-value')}
            />
            <KpiCard
              icon={BookOpen}
              label="Active Recipes"
              value={stats.recipeCount}
              accentColor={Colors.accent}
              onPress={() => router.push('/(tabs)/recipes')}
            />
            <KpiCard
              icon={MenuIcon}
              label="Menus Available"
              value={stats.menuCount}
              accentColor="#E9C46A"
              onPress={() => router.push('/(tabs)/menus')}
            />
            <KpiCard
              icon={Package}
              label="Low Stock Items"
              value={stats.lowStockCount}
              accentColor={stats.lowStockCount > 0 ? '#FF6B6B' : '#4ADE80'}
              onPress={() => router.push('/inventory-alerts')}
            />
          </View>
        </View>

        {/* Operations Hub */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Grid size={12} color={Colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionLabel, Typography.label]}>OPERATIONS HUB</Text>
          </View>
          <TouchableOpacity
            style={styles.opsHubCard}
            onPress={() => setShowOpsHub(true)}
            activeOpacity={0.7}
          >
            <View style={styles.opsHubRow}>
              <View style={styles.opsHubIconWrap}>
                <Grid size={22} color={DARK_FOREST} />
              </View>
              <View style={styles.opsHubInfo}>
                <Text style={styles.opsHubTitle}>Open Operations Hub</Text>
                <Text style={styles.opsHubDesc}>POS, Sync, Menus & more</Text>
              </View>
              <ChevronRight size={18} color={DARK_FOREST} />
            </View>
          </TouchableOpacity>
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
            {stats.totalIngredients === 0 ? (
              <Text style={{ color: IVORY, opacity: 0.3, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 }}>
                No inventory data
              </Text>
            ) : (
              <>
                <View style={styles.healthScoreRow}>
                  <View style={styles.healthScoreContainer}>
                    <View style={[styles.healthScoreCircle, { borderColor: getHealthColor(stats.healthPercent) }]} />
                    <View style={styles.healthScoreTextOverlay}>
                      <Text style={styles.healthScorePercent}>{stats.healthPercent}%</Text>
                      <Text style={[styles.healthScoreLabel, { color: getHealthColor(stats.healthPercent) }]}>HEALTHY</Text>
                    </View>
                  </View>
                  <View style={styles.healthScoreMeta}>
                    <Text style={styles.inventoryInsightText}>
                      {stats.itemsNeedAttention} Items Need Attention
                    </Text>
                    <View style={styles.metaSecondaryRow}>
                      <CheckCircle2 size={10} color="#4ADE80" />
                      <Text style={styles.metaSecondaryText}>
                        {stats.itemsStable} Items Stable
                      </Text>
                    </View>
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
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowNewOp(true)}
          activeOpacity={0.7}
        >
          <Plus size={20} color="white" />
          <Text style={styles.actionButtonText}>New Operation</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Operations Hub Modal */}
      <Modal
        visible={showOpsHub}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOpsHub(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowOpsHub(false)}
        >
          <View style={styles.modalPanel}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Grid size={16} color={Colors.accent} />
              <Text style={styles.modalTitle}>Operations Hub</Text>
              <TouchableOpacity onPress={() => setShowOpsHub(false)}>
                <X size={16} color="rgba(253, 252, 251, 0.4)" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {OPS_HUB_ACTIONS.map((action, i) => {
                const color = action.color || Colors.accent;
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.modalItem}
                    onPress={() => handleOpAction(action)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.modalItemIcon, { backgroundColor: `${color}15` }]}>
                      <action.icon size={16} color={color} />
                    </View>
                    <View style={styles.modalItemInfo}>
                      <Text style={styles.modalItemLabel}>{action.label}</Text>
                      <Text style={styles.modalItemDesc}>{action.description}</Text>
                    </View>
                    <ChevronRight size={14} color={IVORY} opacity={0.2} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* New Operation Modal */}
      <Modal
        visible={showNewOp}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewOp(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowNewOp(false)}
        >
          <View style={styles.modalPanel}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Plus size={16} color={Colors.accent} />
              <Text style={styles.modalTitle}>New Operation</Text>
              <TouchableOpacity onPress={() => setShowNewOp(false)}>
                <X size={16} color="rgba(253, 252, 251, 0.4)" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {NEW_OPERATION_ACTIONS.map((action, i) => {
                const color = action.color || Colors.accent;
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.modalItem}
                    onPress={() => handleNewAction(action)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.modalItemIcon, { backgroundColor: `${color}15` }]}>
                      <action.icon size={16} color={color} />
                    </View>
                    <View style={styles.modalItemInfo}>
                      <Text style={styles.modalItemLabel}>{action.label}</Text>
                      <Text style={styles.modalItemDesc}>{action.description}</Text>
                    </View>
                    <ChevronRight size={14} color={IVORY} opacity={0.2} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: DARK_OLIVE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.08)',
  },
  kpiCardPressable: {
    borderColor: 'rgba(212, 163, 115, 0.15)',
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 10,
    color: IVORY,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  opsHubCard: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.2)',
  },
  opsHubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opsHubIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 26, 21, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  opsHubInfo: {
    flex: 1,
  },
  opsHubTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_FOREST,
  },
  opsHubDesc: {
    fontSize: 11,
    color: DARK_FOREST,
    opacity: 0.6,
    marginTop: 2,
  },
  healthMonitorPanel: {
    backgroundColor: DARK_OLIVE,
    borderRadius: 16,
    padding: 24,
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
  viewAlertsBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginTop: 20,
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
    gap: 8,
    marginBottom: 40,
  },
  actionButtonText: {
    color: 'white',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: '#1C2620',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.15)',
    borderBottomWidth: 0,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(212, 163, 115, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.08)',
  },
  modalTitle: {
    flex: 1,
    color: IVORY,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  modalList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 163, 115, 0.05)',
  },
  modalItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemLabel: {
    color: IVORY,
    fontSize: 14,
    fontWeight: '600',
  },
  modalItemDesc: {
    color: IVORY,
    fontSize: 10,
    opacity: 0.35,
    marginTop: 2,
  },
});
