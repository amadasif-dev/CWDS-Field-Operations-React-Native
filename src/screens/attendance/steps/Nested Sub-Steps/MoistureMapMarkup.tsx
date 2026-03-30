// MoistureMapMarkup.tsx
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Undo, Eraser, Save, SkipForward } from 'lucide-react-native';
import { AppButton } from '../../../../components';
import { BorderRadius, Colors, Spacing, Typography } from '../../../../theme';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MoistureMapMarkupProps {
  room: any;
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const BRUSH_SIZES = {
  small: 5,
  medium: 10,
  large: 15,
};

const MoistureMapMarkup: React.FC<MoistureMapMarkupProps> = ({
  room,
  data,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const canvasRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#2196F3'); // Blue for water damage
  const [brushSize, setBrushSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [paths, setPaths] = useState<any[]>(data.moistureMap?.paths || []);
  const [savedMap, setSavedMap] = useState<string | null>(data.moistureMap?.savedImage || null);

  const baseImage = data.overviewPhotos?.[0]?.uri;

  const handleStartDrawing = useCallback((x: number, y: number) => {
    setIsDrawing(true);
    const newPath = {
      color: currentColor,
      size: BRUSH_SIZES[brushSize],
      points: [{ x, y }],
    };
    setPaths(prev => [...prev, newPath]);
  }, [currentColor, brushSize]);

  const handleDraw = useCallback((x: number, y: number) => {
    if (!isDrawing) return;
    setPaths(prev => {
      const newPaths = [...prev];
      const lastPath = newPaths[newPaths.length - 1];
      lastPath.points.push({ x, y });
      return newPaths;
    });
  }, [isDrawing]);

  const handleEndDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleUndo = useCallback(() => {
    setPaths(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setPaths([]);
  }, []);

  const handleSave = useCallback(async () => {
    if (canvasRef.current) {
      try {
        const imageData = await canvasRef.current.toDataURL();
        setSavedMap(imageData);
        onUpdate({
          moistureMap: {
            paths,
            savedImage: imageData,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to save moisture map:', error);
      }
    }
  }, [paths, onUpdate]);

  const handleSkip = useCallback(() => {
    onNext();
  }, [onNext]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moisture Map Markup</Text>
      <Text style={styles.subtitle}>
        Draw on the room photo to mark affected areas.
      </Text>

      {/* Drawing Tools */}
      <View style={styles.toolbar}>
        <View style={styles.colorTools}>
          <TouchableOpacity
            style={[styles.colorButton, { backgroundColor: '#2196F3', borderWidth: currentColor === '#2196F3' ? 2 : 0 }]}
            onPress={() => setCurrentColor('#2196F3')}
          >
            <View style={styles.colorPreview} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.colorButton, { backgroundColor: '#4CAF50', borderWidth: currentColor === '#4CAF50' ? 2 : 0 }]}
            onPress={() => setCurrentColor('#4CAF50')}
          >
            <View style={styles.colorPreview} />
          </TouchableOpacity>
        </View>

        <View style={styles.brushTools}>
          {Object.entries(BRUSH_SIZES).map(([size, value]) => (
            <TouchableOpacity
              key={size}
              style={[styles.brushButton, brushSize === size && styles.brushButtonActive]}
              onPress={() => setBrushSize(size as any)}
            >
              <View style={[styles.brushPreview, { width: value * 1.5, height: value * 1.5, borderRadius: value / 2 }]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionTools}>
          <TouchableOpacity onPress={handleUndo} style={styles.actionButton}>
            <Undo size={20} color={Colors.gray700} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.actionButton}>
            <Eraser size={20} color={Colors.gray700} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvasContainer}>
        {baseImage && (
          <Image source={{ uri: baseImage }} style={styles.baseImage} />
        )}
        {/* <Canvas
          ref={canvasRef}
          style={styles.canvas}
          onTouchStart={(e) => {
            const { locationX, locationY } = e.nativeEvent;
            handleStartDrawing(locationX, locationY);
          }}
          onTouchMove={(e) => {
            const { locationX, locationY } = e.nativeEvent;
            handleDraw(locationX, locationY);
          }}
          onTouchEnd={handleEndDrawing}
        /> */}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>Water Damage</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Mould Present</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton title="Previous" onPress={onPrev} variant="outline" style={styles.actionBtn} />
        {savedMap ? (
          <AppButton title="Next" onPress={onNext} style={styles.actionBtn} />
        ) : (
          <>
            <AppButton title="Skip" onPress={handleSkip} variant="outline" style={styles.actionBtn} />
            <AppButton title="Save Map" onPress={handleSave} style={styles.actionBtn} />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { ...Typography.h2, color: Colors.navy, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body, color: Colors.gray500, marginBottom: Spacing.xl },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  colorTools: { flexDirection: 'row', gap: Spacing.sm },
  colorButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderColor: Colors.white },
  colorPreview: { width: 30, height: 30, borderRadius: 15 },
  brushTools: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  brushButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: Colors.gray100 },
  brushButtonActive: { backgroundColor: Colors.blueLight },
  brushPreview: { backgroundColor: Colors.gray700 },
  actionTools: { flexDirection: 'row', gap: Spacing.sm },
  actionButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: Colors.gray100 },
  canvasContainer: { position: 'relative', width: SCREEN_WIDTH - Spacing.xl * 2, height: SCREEN_WIDTH - Spacing.xl * 2, marginBottom: Spacing.md, borderWidth: 2, borderColor: Colors.gray300, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  baseImage: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'contain' },
  canvas: { width: '100%', height: '100%', backgroundColor: 'transparent' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, marginBottom: Spacing.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendColor: { width: 16, height: 16, borderRadius: 8 },
  legendText: { ...Typography.caption, color: Colors.gray700 },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  actionBtn: { flex: 1 },
});

export default MoistureMapMarkup;