import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import {
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Plus,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { SupportTicket } from '../../types';

export const SupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const data = await customerApi.getSupportTickets();
    setTickets(data);
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) return;
    setCreating(true);
    const newTkt = await customerApi.createSupportTicket(subject, message);
    setTickets([newTkt, ...tickets]);
    setCreating(false);
    setNewTicketModal(false);
    setSubject('');
    setMessage('');
  };

  const faqs = [
    {
      q: 'How fast is Sevazo delivery?',
      a: 'We deliver in 10-15 minutes using local micro-fulfillment dark stores and certified electric riders.',
    },
    {
      q: 'What if an item is damaged or not fresh?',
      a: 'We offer an instant 100% refund policy. Just open your delivered order, select "Request Return", and refund is instantly credited to your wallet.',
    },
    {
      q: 'How do I apply coupon codes?',
      a: 'In the cart or checkout page, tap "Apply Coupon", choose from available active vouchers or enter your custom promo code.',
    },
    {
      q: 'Can I change my delivery address after placing an order?',
      a: 'Because orders are packed and dispatched in under 3 minutes, address changes are not possible once in transit. You can call your rider directly from the Live Tracking screen.',
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Help & Support"
        subtitle="24x7 Customer Care Assistance"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Quick Contact Action Cards */}
        <View style={styles.quickCardsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setNewTicketModal(true)}
            style={styles.quickCard}
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.primaryLight }]}>
              <MessageSquare size={20} color={Colors.primary} />
            </View>
            <Text style={styles.quickTitle}>Live Chat</Text>
            <Text style={styles.quickSub}>Avg 1m reply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Linking.openURL('tel:1800-123-7382')}
            style={styles.quickCard}
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.secondaryLight }]}>
              <Phone size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.quickTitle}>Toll Free</Text>
            <Text style={styles.quickSub}>1800-123-SEVAZO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Linking.openURL('mailto:support@sevazo.com')}
            style={styles.quickCard}
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.accentOrangeLight }]}>
              <Mail size={20} color={Colors.accentOrange} />
            </View>
            <Text style={styles.quickTitle}>Email Us</Text>
            <Text style={styles.quickSub}>support@sevazo.com</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs Accordion */}
        <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>
        <View style={styles.faqCard}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            const isLast = idx === faqs.length - 1;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                onPress={() => setOpenFaqIndex(isOpen ? null : idx)}
                style={[styles.faqItem, !isLast && styles.faqItemBorder]}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  {isOpen ? (
                    <ChevronUp size={18} color={Colors.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={Colors.textSecondary} />
                  )}
                </View>
                {isOpen ? <Text style={styles.faqAnswer}>{faq.a}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tickets Section */}
        <View style={styles.ticketsHeader}>
          <Text style={styles.sectionHeading}>Your Support Tickets</Text>
          <Button
            title="Raise Ticket"
            onPress={() => setNewTicketModal(true)}
            size="sm"
            icon={<Plus size={14} color={Colors.textInverse} />}
          />
        </View>

        {tickets.map((tkt) => (
          <View key={tkt.id} style={styles.ticketCard}>
            <View style={styles.tktHeader}>
              <Text style={styles.tktNumber}>{tkt.ticketNumber}</Text>
              <Badge
                label={tkt.status}
                variant={tkt.status === 'RESOLVED' ? 'success' : 'warning'}
              />
            </View>
            <Text style={styles.tktSubject}>{tkt.subject}</Text>
            {tkt.lastMessage ? (
              <Text style={styles.tktMessage}>{tkt.lastMessage}</Text>
            ) : null}
            <Text style={styles.tktDate}>Created on {tkt.createdAt}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Raise Ticket Modal */}
      <Modal
        visible={newTicketModal}
        onClose={() => setNewTicketModal(false)}
        title="Raise Support Ticket"
        footer={
          <Button
            title="Submit Ticket"
            onPress={handleCreateTicket}
            loading={creating}
            disabled={!subject.trim() || !message.trim()}
            size="md"
          />
        }
      >
        <Text style={styles.inputLabel}>Subject / Topic *</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g. Issue with recent delivery / refund"
          placeholderTextColor={Colors.textMuted}
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.inputLabel}>Describe your issue *</Text>
        <TextInput
          style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Please provide details about what went wrong..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
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
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  quickCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  quickCard: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickTitle: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  quickSub: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  faqItem: {
    padding: Spacing.md,
  },
  faqItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  faqAnswer: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  ticketsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  ticketCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  tktHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tktNumber: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  tktSubject: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  tktMessage: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tktDate: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
  },
  inputLabel: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  modalInput: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
  },
});
