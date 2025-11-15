import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import { COLORS, CURRENCY_SYMBOL } from '../../constants';

export const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user.fullName || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.trustScore.toFixed(1)} ⭐</Text>
          <Text style={styles.statLabel}>Trust Score</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.totalTransactions}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.verificationStatus}</Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Text style={styles.sectionTitle}>What do you need?</Text>

        <TouchableOpacity style={[styles.actionButton, styles.needCashButton]}>
          <Text style={styles.actionIcon}>💵</Text>
          <Text style={styles.actionTitle}>I Need Cash</Text>
          <Text style={styles.actionDescription}>
            Find someone nearby who has cash
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.haveCashButton]}>
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionTitle}>I Have Cash</Text>
          <Text style={styles.actionDescription}>
            Help someone who needs cash
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>📍 Browse Nearby Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>🤝 My Matches</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>📊 Transaction History</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          1. Post your cash request (need or have)
          {'\n'}2. Get matched with nearby users
          {'\n'}3. Meet at a safe location
          {'\n'}4. Exchange cash and confirm
          {'\n'}5. Build your trust score!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  actions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  needCashButton: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.needCash,
  },
  haveCashButton: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.haveCash,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  quickLinks: {
    padding: 16,
    paddingTop: 0,
  },
  linkButton: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoBox: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
});
