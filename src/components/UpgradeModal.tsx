import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Pressable, 
  Animated, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { UpgradeModalProps } from '../types/subscription';
import { getHistoricalDataPreview } from '../utils/subscriptionUtils';
import { DailyTask } from '../types/Task';

const { width: screenWidth } = Dimensions.get('window');

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  visible, 
  onClose, 
  onUpgrade,
  allTasks = [] // Pass all tasks to show preview
}) => {
  const { theme } = useTheme();
  const { isLoading } = useSubscription();
  
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const historicalData = getHistoricalDataPreview(allTasks);

  useEffect(() => {
    if (visible) {
      // Animate modal appearance
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate modal disappearance
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleUpgrade = async () => {
    try {
      await onUpgrade();
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
      // Handle error gracefully
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Pressable 
          style={styles.dismissArea}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.cardBackground,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          <View style={styles.modalHandle} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Unlock Your Full Journey
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              See your complete history of "one big things"
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={[styles.featureIcon, { color: theme.accent }]}>📅</Text>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  Lifetime Access
                </Text>
                <Text style={[styles.featureDescription, { color: theme.secondaryText }]}>
                  View every "one big thing" you've ever completed
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={[styles.featureIcon, { color: theme.accent }]}>📊</Text>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  Progress Tracking
                </Text>
                <Text style={[styles.featureDescription, { color: theme.secondaryText }]}>
                  See your growth journey over time
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={[styles.featureIcon, { color: theme.accent }]}>✨</Text>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  Beautiful Experience
                </Text>
                <Text style={[styles.featureDescription, { color: theme.secondaryText }]}>
                  Same elegant interface, unlimited data
                </Text>
              </View>
            </View>
          </View>

          {historicalData.totalTasks > 0 && (
            <View style={[styles.previewContainer, { backgroundColor: theme.accent + '10' }]}>
              <Text style={[styles.previewTitle, { color: theme.accent }]}>
                Your Journey So Far
              </Text>
              <View style={styles.previewStats}>
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: theme.accent }]}>
                    {historicalData.totalTasks}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                    Total Tasks
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: theme.accent }]}>
                    {historicalData.completedTasks}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                    Completed
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: theme.accent }]}
              onPress={handleUpgrade}
              disabled={isLoading}
            >
              <Text style={[styles.upgradeButtonText, { color: 'white' }]}>
                {isLoading ? 'Upgrading...' : 'Upgrade to Premium'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.secondaryText }]}>
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsContainer: {
    gap: 12,
  },
  upgradeButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
}); 