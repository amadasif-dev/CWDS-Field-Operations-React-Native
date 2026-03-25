import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  totalSteps,
  labels,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={stepNum}>
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
              <View
                style={[
                  styles.step,
                  isCompleted && styles.stepCompleted,
                  isActive && styles.stepActive,
                ]}
              >
                {isCompleted ? (
                  <Check size={14} color={Colors.white} strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.stepText,
                      (isActive || isCompleted) && styles.stepTextActive,
                    ]}
                  >
                    {stepNum}
                  </Text>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>
      {labels && labels.length > 0 && (
        <View style={styles.labelsRow}>
          {labels.map((label, index) => (
            <Text
              key={index}
              style={[
                styles.label,
                index + 1 <= currentStep && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          ))}
        </View>
      )}
      <Text style={styles.progress}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
};

const STEP_SIZE = 28;

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    width: STEP_SIZE,
    height: STEP_SIZE,
    borderRadius: STEP_SIZE / 2,
    backgroundColor: Colors.gray100,
    borderWidth: 2,
    borderColor: Colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  stepActive: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  stepText: {
    ...Typography.small,
    fontWeight: '700',
    color: Colors.gray500,
  },
  stepTextActive: {
    color: Colors.white,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.gray300,
    marginHorizontal: Spacing.xxs,
  },
  connectorCompleted: {
    backgroundColor: Colors.green,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  label: {
    ...Typography.small,
    color: Colors.gray500,
    textAlign: 'center',
    flex: 1,
  },
  labelActive: {
    color: Colors.navy,
    fontWeight: '600',
  },
  progress: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
});

export default React.memo(StepProgressBar);
