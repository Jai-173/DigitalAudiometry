import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import { useAudioPlayer } from "expo-audio";
import Typo from "@/components/Typo";
import Animated, { FadeInDown, FadeInUp, FadeIn } from "react-native-reanimated";
import { Entypo } from "@expo/vector-icons";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];

const HEADPHONE_REF_DBFS = 90;

const CALIBRATION_REFS_AC: Record<number, number> = {
  250: 15,
  500: 5,
  1000: 0,
  2000: -5,
  4000: -10,
  8000: -5,
};

const CALIBRATION_REFS_BC: Record<number, number> = {
  250: 25,
  500: 15,
  1000: 10,
  2000: 0,
  4000: -5,
  8000: 5,
};

const MAX_DB_HL = 110;
const MIN_DB_HL = -10;

const TONE_DURATION_MS = 1000;export default function TestFlowScreen() {
  const router = useRouter();
  const { ear, type, leftResults } = useLocalSearchParams<{ ear: string, type: string, leftResults?: string }>();
  const isBoneConduction = type === 'bone';

  const [index, setIndex] = useState(0);
  const [dbLevel, setDbLevel] = useState(30);
  const [thresholds, setThresholds] = useState<any[]>([]);

  const freq = FREQUENCIES[index];

  const soundMap: Record<string, any> = {
    "250_left": require("../../assets/sounds/left_250hz.wav"),
    "250_right": require("../../assets/sounds/right_250hz.wav"),
    "500_left": require("../../assets/sounds/left_500hz.wav"),
    "500_right": require("../../assets/sounds/right_500hz.wav"),
    "1000_left": require("../../assets/sounds/left_1000hz.wav"),
    "1000_right": require("../../assets/sounds/right_1000hz.wav"),
    "2000_left": require("../../assets/sounds/left_2000hz.wav"),
    "2000_right": require("../../assets/sounds/right_2000hz.wav"),
    "4000_left": require("../../assets/sounds/left_4000hz.wav"),
    "4000_right": require("../../assets/sounds/right_4000hz.wav"),
    "8000_left": require("../../assets/sounds/left_8000hz.wav"),
    "8000_right": require("../../assets/sounds/right_8000hz.wav"),
  };

  const key = `${freq}_${ear?.toLowerCase()}`;
  const player = useAudioPlayer(soundMap[key]);

  function getCalibrationOffset(frequency: number, isBC: boolean): number {
    const refs = isBC ? CALIBRATION_REFS_BC : CALIBRATION_REFS_AC;
    return refs[frequency] || 0;
  }

  function dbToVolume(dbHL: number, frequency: number, isBC: boolean): number {
    const frequencyOffset = getCalibrationOffset(frequency, isBC);
    const targetDbFS = dbHL + frequencyOffset - HEADPHONE_REF_DBFS;
    const amplitude = Math.pow(10, targetDbFS / 20);
    return Math.min(1, Math.max(0, amplitude));
  }  async function handlePlay() {
    try {
      if (!player) return;

      try {
        await player.pause();
      } catch (_) { }

      const volume = dbToVolume(dbLevel, freq, isBoneConduction);
      player.volume = volume;
      await player.seekTo(0);
      await player.play();

      setTimeout(async () => {
        try {
          await player.pause();
        } catch (e) { }
      }, TONE_DURATION_MS);
    } catch (e) {
      console.error("Playback error:", e);
      Alert.alert("Audio Error", "Could not play the tone.");
    }
  }

  React.useEffect(() => {
    return () => {
      if (player) {
        try {
          player.pause();
        } catch (_) { }
      }
    };
  }, [player, freq]);

  function handleDbUp() {
    setDbLevel((prev) => Math.min(prev + 5, MAX_DB_HL));
  }

  function handleDbDown() {
    setDbLevel((prev) => Math.max(prev - 5, MIN_DB_HL));
  }

  function handleMarkThreshold() {
    const newThreshold = { freq, dbLevel, ear, type: isBoneConduction ? 'BC' : 'AC' };
    const currentEarResults = JSON.stringify([...thresholds, newThreshold]);

    if (index < FREQUENCIES.length - 1) {
      setIndex(index + 1);
      setDbLevel(30);
      setThresholds((prev) => [...prev, newThreshold]);
    } else if (ear === 'left' && !leftResults) {
      (router.replace as any)({
        pathname: "/(main)/testflow",
        params: {
          ear: "right",
          type,
          leftResults: currentEarResults,
        },
      });
    } else {

      (router.replace as any)({
        pathname: "/(main)/results",
        params: {
          leftResults: leftResults || (ear === 'left' ? currentEarResults : '[]'),
          rightResults: ear === 'right' ? currentEarResults : '[]',
        },
      });
    }
  }

  function handleBack() {
    if (index > 0) {
      setThresholds((prev) => {
        const prevThresholds = prev.slice(0, -1);
        const lastThreshold = prevThresholds[prevThresholds.length - 1];
        setDbLevel(lastThreshold?.dbLevel || 30);
        return prevThresholds;
      });
      setIndex(index - 1);
    }
  }

  const progress = ((index + 1) / FREQUENCIES.length) * 100;

  return (
    <ScreenWrapper showPattern>
      <View style={styles.container}>
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.headerContainer}>
          <Typo style={styles.header}>
            {ear === "left" ? "Left" : "Right"} Ear {isBoneConduction ? "(BC)" : "(AC)"} Test
          </Typo>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                entering={FadeIn}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Typo style={styles.progressText}>
              Step {index + 1} of {FREQUENCIES.length}
            </Typo>
          </View>

          <View style={styles.frequencyCard}>
            <Typo style={styles.frequencyLabel}>Testing Frequency</Typo>
            <Typo style={styles.frequencyValue}>{freq} Hz</Typo>
          </View>
        </Animated.View>

        <Animated.View
          key={`freq-${freq}`}
          entering={FadeInDown.duration(500).springify()}
          style={styles.controlsContainer}
        >
          <AnimatedTouchable style={styles.playBtn} onPress={handlePlay} activeOpacity={0.85}>
            <Entypo name="controller-play" size={24} color={colors.white} />
            <Typo style={styles.playText}>Play Tone</Typo>
          </AnimatedTouchable>

          <View style={styles.volumeSection}>
            <Typo style={styles.volumeTitle}>Adjust Intensity</Typo>

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.volumeBtn}
                onPress={handleDbDown}
                activeOpacity={0.7}
                disabled={dbLevel <= MIN_DB_HL}
              >
                <Typo style={styles.volumeText}>-</Typo>
              </TouchableOpacity>

              <View style={styles.volumeDisplay}>
                <Typo style={styles.volumeLevel}>{dbLevel}</Typo>
                <Typo style={styles.volumeUnit}>dB HL</Typo>
              </View>

              <TouchableOpacity
                style={styles.volumeBtn}
                onPress={handleDbUp}
                activeOpacity={0.7}
                disabled={dbLevel >= MAX_DB_HL}
              >
                <Typo style={styles.volumeText}>+</Typo>
              </TouchableOpacity>
            </View>

            <View style={styles.volumeBar}>
              <View
                style={[
                  styles.volumeBarFill,
                  { width: `${((dbLevel - MIN_DB_HL) / (MAX_DB_HL - MIN_DB_HL)) * 100}%` }
                ]}
              />
            </View>
            <Typo style={styles.progressText}>
              Range: {MIN_DB_HL} dB HL to {MAX_DB_HL} dB HL
            </Typo>
          </View>
        </Animated.View>

        <View style={styles.buttonRow}>
          <AnimatedTouchable
            entering={FadeInUp.duration(600).delay(100).springify()}
            style={[
              styles.actionBtn,
              styles.backBtn,
              index === 0 && styles.actionBtnDisabled,
            ]}
            onPress={handleBack}
            activeOpacity={0.85}
            disabled={index === 0}
          >
            <Entypo
              name="chevron-left"
              size={20}
              color={index === 0 ? colors.neutral400 : colors.primaryDark}
            />
            <Typo
              style={{
                ...styles.actionText,
                color: index === 0 ? colors.neutral400 : colors.primaryDark,
              }}
            >
              Back
            </Typo>
          </AnimatedTouchable>

          <AnimatedTouchable
            entering={FadeInUp.duration(600).delay(100).springify()}
            style={[styles.actionBtn, styles.markBtn]}
            onPress={handleMarkThreshold}
            activeOpacity={0.85}
          >
            <View style={styles.nextContent}>
              <Typo style={styles.markText}>
                {index < FREQUENCIES.length - 1 ? "Mark & Next" : "Finish Test"}
              </Typo>
              <Entypo
                name="chevron-right"
                size={20}
                color={colors.white}
              />
            </View>
          </AnimatedTouchable>
        </View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(200).springify()}
          style={styles.instructionCard}
        >
          <Typo style={styles.instructionText}>
            💡 **{isBoneConduction ? "Bone Conduction" : "Air Conduction"} Test** - Adjust intensity to the softest level you can clearly hear.
          </Typo>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingX._25,
    paddingVertical: spacingY._30,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacingX._15,
    paddingHorizontal: spacingX._5,
    width: "100%",
  },
  actionBtn: {
    borderRadius: radius._15,
    paddingVertical: verticalScale(16),
    paddingHorizontal: spacingX._25,
    alignItems: "center",
    flexDirection: "row",
    gap: spacingX._7,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backBtn: {
    flex: 1,
    width: "48%",
    backgroundColor: colors.neutral100,
    borderWidth: 1.5,
    borderColor: colors.neutral300,
  },
  actionBtnDisabled: {
    backgroundColor: colors.neutral50,
    borderColor: colors.neutral200,
  },
  actionText: {
    color: colors.primaryDark,
    fontWeight: "600",
    fontSize: scale(16),
    letterSpacing: 0.3,
  },
  nextContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._3,
    width: "100%",
    justifyContent: "flex-end",
  },
  headerContainer: {
    alignItems: "center",
  },
  controlsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: scale(28),
    color: colors.primaryDark,
    fontWeight: "800",
    marginBottom: spacingY._20,
    letterSpacing: -0.3,
  },
  progressContainer: {
    width: "100%",
    marginBottom: spacingY._20,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral300,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: spacingY._7,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: scale(13),
    color: colors.neutral600,
    textAlign: "center",
    fontWeight: "600",
  },
  frequencyCard: {
    backgroundColor: colors.primary + "15",
    borderRadius: radius._15,
    paddingVertical: spacingY._15,
    paddingHorizontal: spacingX._25,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary + "30",
  },
  frequencyLabel: {
    fontSize: scale(13),
    color: colors.neutral600,
    fontWeight: "600",
    marginBottom: spacingY._5,
  },
  frequencyValue: {
    fontSize: scale(32),
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: -1,
  },
  playBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius._20,
    paddingVertical: verticalScale(18),
    paddingHorizontal: spacingX._40,
    alignItems: "center",
    flexDirection: "row",
    gap: spacingX._12,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: spacingY._35,
  },
  playText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: scale(18),
    letterSpacing: 0.3,
  },
  volumeSection: {
    width: "100%",
    alignItems: "center",
  },
  volumeTitle: {
    fontSize: scale(15),
    color: colors.neutral700,
    fontWeight: "600",
    marginBottom: spacingY._15,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacingY._15,
    gap: spacingX._20,
  },
  volumeBtn: {
    backgroundColor: colors.neutral200,
    borderRadius: radius._15,
    paddingVertical: verticalScale(12),
    paddingHorizontal: spacingX._25,
    borderWidth: 2,
    borderColor: colors.neutral300,
  },
  volumeText: {
    color: colors.primaryDark,
    fontSize: scale(28),
    fontWeight: "700",
  },
  volumeDisplay: {
    alignItems: "center",
    minWidth: scale(100),
  },
  volumeLevel: {
    color: colors.primaryDark,
    fontSize: scale(36),
    fontWeight: "800",
    letterSpacing: -1,
  },
  volumeUnit: {
    color: colors.neutral600,
    fontSize: scale(14),
    fontWeight: "600",
    marginTop: spacingY._5,
  },
  volumeBar: {
    width: "90%",
    height: 8,
    backgroundColor: colors.neutral300,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacingY._7,
  },
  volumeBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  markBtn: {
    flex: 1,
    width: "48%",
    backgroundColor: colors.primaryAccent,
    justifyContent: "flex-end",
    elevation: 4,
    shadowColor: colors.primaryAccent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  markText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: scale(17),
    letterSpacing: 0.3,
  },
  instructionCard: {
    backgroundColor: colors.primary + "10",
    borderRadius: radius._12,
    padding: spacingY._12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginTop: spacingY._15,
  },
  instructionText: {
    fontSize: scale(13),
    color: colors.neutral700,
    textAlign: "center",
    lineHeight: scale(20),
    fontWeight: "600",
  },
});