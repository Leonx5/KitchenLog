import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TrendingUp, ClipboardList, AlertCircle, Plus } from 'lucide-react-native';

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: any;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}
    >
      <Icon size={22} />
      <Text style={{ marginTop: 8, color: '#6B7280' }}>{title}</Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{value}</Text>
    </View>
  );
}

export default function Dashboard() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          marginBottom: 4,
        }}
      >
        PrepFlow
      </Text>

      <Text
        style={{
          color: '#6B7280',
          marginBottom: 20,
        }}
      >
        Kitchen Operations Hub
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <StatCard
          title="Active Menus"
          value="4"
          icon={ClipboardList}
        />

        <StatCard
          title="Production Value"
          value="KSh 124K"
          icon={TrendingUp}
        />
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 10,
        }}
      >
        Inventory Alerts
      </Text>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          padding: 14,
          borderRadius: 12,
          marginBottom: 10,
        }}
      >
        <Text>⚠ Chicken Breast low stock</Text>
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          padding: 14,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Text>⚠ Heavy Cream low stock</Text>
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 10,
        }}
      >
        Recent Activity
      </Text>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          padding: 14,
          borderRadius: 12,
          marginBottom: 10,
        }}
      >
        <Text>Recipe Updated — Spicy Thai Curry</Text>
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          padding: 14,
          borderRadius: 12,
          marginBottom: 10,
        }}
      >
        <Text>Menu Finalized — Wedding Reception</Text>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#2563EB',
          padding: 16,
          borderRadius: 12,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        <Plus size={20} color="white" />
        <Text
          style={{
            color: 'white',
            marginLeft: 8,
            fontWeight: '600',
          }}
        >
          New Operation
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}