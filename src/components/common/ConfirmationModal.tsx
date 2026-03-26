import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Camera,
} from 'lucide-react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../theme';
import AppButton from './AppButton';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  showDetails?: boolean;
  details?: {
    siteAssessment?: string;
    condition?: string;
    workDocumentation?: boolean;
    photoCount?: number;
  };
  type?: 'warning' | 'success' | 'info';
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Submit Report',
  message = 'Are you sure you want to submit this attendance report? This action cannot be undone.',
  confirmText = 'Submit',
  cancelText = 'Cancel',
  showDetails = true,
  details,
  type = 'warning',
  loading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={48} color={Colors.orange} />;
      case 'success':
        return <CheckCircle size={48} color={Colors.green} />;
      case 'info':
        return <FileText size={48} color={Colors.blue} />;
      default:
        return <AlertTriangle size={48} color={Colors.orange} />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'warning':
        return Colors.orange;
      case 'success':
        return Colors.green;
      case 'info':
        return Colors.blue;
      default:
        return Colors.orange;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${getHeaderColor()}10` },
                ]}
              >
                {getIcon()}
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              {showDetails && details && (
                <View style={styles.detailsContainer}>
                  {(details.siteAssessment || details.condition) && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailHeader}>
                        <FileText size={16} color={Colors.gray700} />
                        <Text style={styles.detailTitle}>Site Assessment</Text>
                      </View>
                      <View style={styles.detailContent}>
                        {details.siteAssessment && (
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Assessment:</Text>
                            <Text style={styles.detailValue}>
                              {details.siteAssessment}
                            </Text>
                          </View>
                        )}
                        {details.condition && (
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Condition:</Text>
                            <Text
                              style={[
                                styles.detailValue,
                                details.condition === 'Excellent' &&
                                  styles.excellentText,
                                details.condition === 'Good' && styles.goodText,
                                details.condition === 'Fair' && styles.fairText,
                                details.condition === 'Poor' && styles.poorText,
                              ].filter(Boolean)}
                            >
                              {details.condition}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {details.workDocumentation !== undefined && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailHeader}>
                        <CheckCircle size={16} color={Colors.gray700} />
                        <Text style={styles.detailTitle}>
                          Work Documentation
                        </Text>
                      </View>
                      <View style={styles.detailContent}>
                        <Text
                          style={[
                            styles.documentationStatus,
                            details.workDocumentation && styles.documentedText,
                          ].filter(Boolean)}
                        >
                          {details.workDocumentation
                            ? 'Documented ✓'
                            : 'Not Documented'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {details.photoCount !== undefined && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailHeader}>
                        <Camera size={16} color={Colors.gray700} />
                        <Text style={styles.detailTitle}>Photo Evidence</Text>
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.photoCount}>
                          {details.photoCount}{' '}
                          {details.photoCount === 1 ? 'photo' : 'photos'}{' '}
                          captured
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.actions}>
                <AppButton
                  title={cancelText}
                  onPress={onClose}
                  variant="outline"
                  style={styles.actionButton}
                  disabled={loading}
                />
                <AppButton
                  title={confirmText}
                  onPress={onConfirm}
                  variant={type === 'warning' ? 'primary' : 'primary'}
                  style={[
                    styles.actionButton,
                    type === 'warning' ? styles.warningButton : null,
                  ].filter(Boolean)}
                  loading={loading}
                  disabled={loading}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    color: Colors.gray700,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  detailRow: {
    marginBottom: Spacing.md,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  detailTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    fontSize: 14,
  },
  detailContent: {
    paddingLeft: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.gray700,
    fontWeight: '500',
  },
  detailValue: {
    ...Typography.caption,
    color: Colors.gray700,
    fontWeight: '600',
  },
  excellentText: {
    color: Colors.green,
  },
  goodText: {
    color: Colors.blue,
  },
  fairText: {
    color: Colors.orange,
  },
  poorText: {
    color: Colors.red,
  },
  documentationStatus: {
    ...Typography.body,
    color: Colors.gray700,
  },
  documentedText: {
    color: Colors.green,
    fontWeight: '600',
  },
  photoCount: {
    ...Typography.body,
    color: Colors.gray700,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  warningButton: {
    backgroundColor: Colors.orange,
  },
});

export default ConfirmationModal;