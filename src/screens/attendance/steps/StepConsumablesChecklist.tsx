import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Package, Minus, Plus } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData, updateConsumable, setConsumables } from '../../../store/slices/attendanceSlice';
import {
  AppButton,
  AppCard,
  AppInput,
  AppSearchBar,
  BottomSheetAlert,
} from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';

interface StepConsumablesChecklistProps {
  onNext: () => void;
  onPrev: () => void;
}

// 22 Consumables items as per requirements
const CONSUMABLES_ITEMS = [
  { id: 'plastic_sheeting', name: 'Plastic sheeting', unit: 'metres' },
  { id: 'tape_masking', name: 'Tape — masking', unit: 'rolls' },
  { id: 'tape_duct', name: 'Tape — duct', unit: 'rolls' },
  { id: 'zip_ties', name: 'Zip ties', unit: 'pack' },
  { id: 'cable_ties', name: 'Cable ties', unit: 'pack' },
  { id: 'disposable_gloves', name: 'Disposable gloves', unit: 'pairs' },
  { id: 'p2_respirator', name: 'P2 respirator masks', unit: 'units' },
  { id: 'tyvek_coveralls', name: 'Tyvek coveralls', unit: 'units' },
  { id: 'safety_glasses', name: 'Safety glasses', unit: 'units' },
  { id: 'boot_covers', name: 'Boot covers', unit: 'pairs' },
  { id: 'biohazard_bags', name: 'Biohazard bags', unit: 'units' },
  { id: 'drop_sheets', name: 'Drop sheets', unit: 'units' },
  { id: 'absorbent_pads', name: 'Absorbent pads', unit: 'units' },
  { id: 'cleaning_cloths', name: 'Cleaning cloths/rags', unit: 'units' },
  { id: 'antibacterial_spray', name: 'Antibacterial spray', unit: 'litres' },
  { id: 'disinfectant', name: 'Disinfectant solution', unit: 'litres' },
  { id: 'hepa_filter', name: 'HEPA filter', unit: 'units' },
  { id: 'fan_belt', name: 'Fan belt', unit: 'units' },
  { id: 'polyfilm', name: 'Moisture barriers — polyfilm', unit: 'sq/m' },
  { id: 'desiccant', name: 'Desiccant', unit: 'kg' },
  { id: 'timber_wedges', name: 'Timber wedges / shims', unit: 'units' },
  { id: 'other', name: 'Other', unit: 'units' },
];

const StepConsumablesChecklist: React.FC<StepConsumablesChecklistProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const savedConsumables = useAppSelector(state => state.attendance.consumables);
  const stepData = useAppSelector(state => state.attendance.stepData[7]);

  const [consumables, setConsumablesState] = useState<Record<string, number>>(
    savedConsumables || stepData?.consumables || {}
  );
  const [otherName, setOtherName] = useState(
    stepData?.otherName as string || ''
  );
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const updateQuantity = useCallback((id: string, delta: number) => {
    setConsumablesState(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  }, []);

  const handleNext = useCallback(() => {
    // Save consumables data
    const consumablesData = { ...consumables };
    
    // Handle "Other" item
    if (otherName.trim() && consumablesData.other && consumablesData.other > 0) {
      consumablesData[`other_${otherName}`] = consumablesData.other;
      delete consumablesData.other;
    }
    
    // Dispatch to Redux
    Object.entries(consumablesData).forEach(([id, quantity]) => {
      if (quantity > 0) {
        dispatch(updateConsumable({ id, quantity }));
      }
    });
    
    dispatch(
      setStepData({
        step: 7,
        data: {
          consumables: consumablesData,
          otherName: otherName.trim(),
          hasConsumables: true,
        },
      })
    );
    onNext();
  }, [consumables, otherName, dispatch, onNext]);

  const getTotalItems = useCallback(() => {
    return Object.values(consumables).reduce((sum, qty) => sum + qty, 0);
  }, [consumables]);

  const getTotalValue = useCallback(() => {
    // This is for informational purposes only - not billable yet
    return Object.values(consumables).reduce((sum, qty) => sum + qty, 0);
  }, [consumables]);

  const filteredItems = CONSUMABLES_ITEMS.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Consumables Used</Text>
      <Text style={styles.subtitle}>
        Log all consumables used during this attendance for billing purposes.
      </Text>

      <AppSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search consumables..."
        containerStyle={styles.searchContainer}
      />

      {/* Running Total */}
      <AppCard variant="outlined" padding="md" style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Package size={20} color={Colors.blue} />
          <Text style={styles.totalLabel}>Total Items Used:</Text>
          <Text style={styles.totalValue}>{getTotalItems()}</Text>
        </View>
        <Text style={styles.totalSubtext}>
          * Final billing will be calculated by the office
        </Text>
      </AppCard>

      {/* Consumables List */}
      <View style={styles.consumablesList}>
        {filteredItems.map(item => (
          <AppCard
            key={item.id}
            variant="outlined"
            padding="md"
            style={styles.consumableCard}
          >
            <View style={styles.consumableRow}>
              <View style={styles.consumableInfo}>
                <Text style={styles.consumableName}>{item.name}</Text>
                <Text style={styles.consumableUnit}>Unit: {item.unit}</Text>
              </View>
              <View style={styles.quantityControl}>
                <AppButton
                  title=""
                  icon={<Minus size={16} color={Colors.white} />}
                  onPress={() => updateQuantity(item.id, -1)}
                  variant="primary"
                  size="sm"
                  style={styles.quantityBtn}
                />
                <Text style={styles.quantity}>
                  {consumables[item.id] || 0}
                </Text>
                <AppButton
                  title=""
                  icon={<Plus size={16} color={Colors.white} />}
                  onPress={() => updateQuantity(item.id, 1)}
                  variant="primary"
                  size="sm"
                  style={styles.quantityBtn}
                />
              </View>
            </View>
          </AppCard>
        ))}
      </View>

      {/* Other Item with Custom Name */}
      <AppCard variant="outlined" padding="md" style={styles.otherCard}>
        <Text style={styles.otherTitle}>Other Consumables</Text>
        <Text style={styles.otherSubtitle}>
          Add any consumables not listed above
        </Text>
        
        <AppInput
          placeholder="Item name"
          value={otherName}
          onChangeText={setOtherName}
        />
        
          <View style={styles.consumableRow}>
            <Text style={styles.consumableName}>Quantity</Text>
            <View style={styles.quantityControl}>
              <AppButton
                title=""
                icon={<Minus size={16} color={Colors.white} />}
                onPress={() => updateQuantity('other', -1)}
                variant="primary"
                size="sm"
                style={styles.quantityBtn}
              />
              <Text style={styles.quantity}>
                {consumables.other || 0}
              </Text>
              <AppButton
                title=""
                icon={<Plus size={16} color={Colors.white} />}
                onPress={() => updateQuantity('other', 1)}
                variant="primary"
                size="sm"
                style={styles.quantityBtn}
              />
            </View>
          </View>
        
        {otherName.trim() && (consumables.other || 0) > 0 && (
          <Text style={styles.otherNote}>
            This will be recorded as: {otherName} x {consumables.other}
          </Text>
        )}
      </AppCard>

      <View style={styles.actions}>
        <AppButton
          title="Previous"
          onPress={onPrev}
          variant="outline"
          style={styles.actionBtn}
        />
        <AppButton
          title="Next"
          onPress={handleNext}
          style={styles.actionBtn}
        />
      </View>

      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Validation Error"
        message="Please complete all required fields."
        primaryLabel="OK"
        onClose={() => setShowValidationAlert(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray500,
    marginBottom: Spacing.xl,
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  totalCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.navy,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  totalLabel: {
    ...Typography.bodyBold,
    color: Colors.white,
    flex: 1,
  },
  totalValue: {
    ...Typography.h3,
    color: Colors.white,
  },
  totalSubtext: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  consumablesList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  consumableCard: {
    marginBottom: 0,
  },
  consumableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consumableInfo: {
    flex: 1,
  },
  consumableName: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  consumableUnit: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: Spacing.xxs,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 0,
  },
  quantity: {
    ...Typography.bodyBold,
    color: Colors.gray700,
    minWidth: 30,
    textAlign: 'center',
    fontSize: 16,
  },
  otherCard: {
    marginBottom: Spacing.xl,
  },
  otherTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  otherSubtitle: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.md,
  },
  otherInput: {
    marginBottom: Spacing.md,
  },
  otherNote: {
    ...Typography.caption,
    color: Colors.blue,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
});

export default React.memo(StepConsumablesChecklist);