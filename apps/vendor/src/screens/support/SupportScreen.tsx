import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { HelpCircle, MessageSquare, Phone, Plus, Check } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { SupportTicket } from '../../types';
import { VendorApi } from '../../services/vendorApi';

export const SupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const loadTickets = async () => {
    try {
      const data = await VendorApi.getTickets();
      setTickets(data);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async () => {
    if (!subject || !message) {
      Alert.alert('Required', 'Please fill in ticket subject and message.');
      return;
    }

    try {
      await VendorApi.createTicket(subject, message);
      Alert.alert('Ticket Submitted', 'Our partner support team will respond shortly.');
      setSubject('');
      setMessage('');
      setModalVisible(false);
      loadTickets();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Merchant Support"
        subtitle="Partner desk, helpdesk tickets & FAQs"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Raise Ticket</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Support Channels Card */}
        <View style={styles.channelsCard}>
          <View style={styles.channelRow}>
            <Phone size={20} color={Colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.channelTitle}>Partner Hotline</Text>
              <Text style={styles.channelSub}>1800-SEVAZO-MERCHANT (Toll-Free)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.channelRow}>
            <MessageSquare size={20} color={Colors.secondary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.channelTitle}>WhatsApp Support</Text>
              <Text style={styles.channelSub}>+91 98000 12345 (Instant Chat)</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>📋 Your Support Tickets</Text>

        {tickets.map((t) => (
          <View key={t.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketNum}>{t.ticketNumber}</Text>
              <Badge
                label={t.status}
                variant={t.status === 'RESOLVED' ? 'success' : 'warning'}
                size="sm"
                dot
              />
            </View>
            <Text style={styles.ticketSubject}>{t.subject}</Text>
            {t.messages?.[0] && (
              <Text style={styles.ticketMessage} numberOfLines={2}>
                "{t.messages[0].message}"
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Open Support Ticket"
      >
        <Input
          label="Subject *"
          placeholder="e.g. Issue with settlement statement #481"
          value={subject}
          onChangeText={setSubject}
        />

        <Input
          label="Detailed Description *"
          placeholder="Please describe your query or issue in detail..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />

        <Button
          title="Submit Ticket"
          onPress={handleCreateTicket}
          leftIcon={<Check size={18} color="#FFFFFF" />}
          style={{ marginTop: 10 }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  channelsCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
    ...Shadows.card,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  channelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  channelSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  ticketCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
    ...Shadows.card,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ticketNum: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ticketMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
