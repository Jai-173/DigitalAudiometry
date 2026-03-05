import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import Typo from "@/components/Typo";
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withRepeat, withTiming, useSharedValue } from "react-native-reanimated";
import { Entypo } from '@expo/vector-icons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const CALIBRATION = {
  REFERENCE_FREQ: 1000,  // 1 kHz reference tone
  INSTRUCTION_DB_HL: 40,     // Target loudness level for user adjustment
  APP_INITIAL_VOLUME: 0.4, // Fixed digital volume (40% max) to ensure sound is present but not loud
};

export default function CalibrateScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const pulseAnim = useSharedValue(1);

  const player = useAudioPlayer(require("../../assets/sounds/left_1000hz.wav"));
  const status = useAudioPlayerStatus(player);

  React.useEffect(() => {
    if (status && typeof status.playing === 'boolean') {
      setIsPlaying(Boolean(status.playing));
    }
  }, [status?.playing]);

  React.useEffect(() => {
    if (isPlaying) {
      pulseAnim.value = withRepeat(
        withTiming(1.1, { duration: 800 }),
        -1, // infinite repeat
        true // reverse animation
      );
    } else {
      pulseAnim.value = withTiming(1);
    }
  }, [isPlaying]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  function getReferenceVolume(): number {
    return CALIBRATION.APP_INITIAL_VOLUME;
  }

  async function handlePlay() {
    try {
      if (!player) {
        Alert.alert("Error", "Audio player not ready.");
        return;
      }
      
      if (status?.playing) {
        await player.pause();
      } else {
        player.volume = getReferenceVolume(); 
        await player.seekTo(0);
        await player.play();
        setTimeout(async () => {
          if (player && status?.playing) {
            try {
              await player.pause();
            } catch (_) {}
          }
        }, 5000); 
      }
    } catch (e) {
      console.error("Audio error:", e);
      Alert.alert("Error", "Could not play the tone.");
    }
  }

  React.useEffect(() => {
    return () => {
      if (player) {
        try {
          player.pause();
        } catch (_) {}
      }
    };
  }, [player]);

  return (
    <ScreenWrapper showPattern>
      <View style={styles.container}>
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={styles.headerContainer}
        >
          <Typo style={styles.header}>Device Calibration</Typo>
          
          <View style={styles.instructionCard}>
            <Typo style={styles.instructionTitle}>Get Ready to Test:</Typo>
            <View style={styles.instructionItem}>
              <Typo style={styles.bullet}>1.</Typo>
              <Typo style={styles.instructionText}>
                Put on your headphones.
              </Typo>
            </View>
            <View style={styles.instructionItem}>
              <Typo style={styles.bullet}>2.</Typo>
              <Typo style={styles.instructionText}>
                Tap **"Play 1 kHz Tone"** below to start the sound.
              </Typo>
            </View>
            <View style={styles.instructionItem}>
              <Typo style={styles.bullet}>3.</Typo>
              <Typo style={styles.instructionText}>
                Use your **phone's physical volume buttons** to adjust the loudness.
              </Typo>
            </View>
            <View style={styles.instructionItem}>
              <Typo style={styles.bullet}>4.</Typo>
              <Typo style={styles.instructionText}>
                Set the tone to a **soft, comfortable listening level** (roughly **{CALIBRATION.INSTRUCTION_DB_HL} dB**).
              </Typo>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(100).springify()}
          style={styles.controlsContainer}
        >
          <Animated.View style={pulseStyle}>
            <TouchableOpacity
              style={[styles.playBtn, isPlaying && styles.playBtnActive]}
              onPress={handlePlay}
              activeOpacity={0.8}
            >
              <Entypo name={isPlaying ? "controller-paus" : "controller-play"} size={28} color={colors.white} />
              <Typo style={styles.playText}>
                {isPlaying ? " Stop Tone" : " Play 1 kHz Tone"}
              </Typo>
            </TouchableOpacity>
          </Animated.View>

          {isPlaying && (
            <Animated.View 
              entering={FadeInDown.duration(400)}
              style={styles.playingIndicator}
            >
              {/* Added a simple visual indicator to show sound is playing */}
              <View style={styles.waveBar} />
              <View style={[styles.waveBar, styles.waveBarDelay]} />
              <View style={[styles.waveBar, styles.waveBarDelay2]} />
              <Typo style={styles.playingText}>Adjusting System Volume...</Typo>
            </Animated.View>
          )}
        </Animated.View>

        <AnimatedTouchable
          entering={FadeInDown.duration(600).delay(200).springify()}
          style={styles.continueBtn}
          onPress={() => router.push("/(main)/test")}
          activeOpacity={0.85}
        >
          <Typo style={styles.continueText}>Calibration Complete - Continue to Test</Typo>
        </AnimatedTouchable>

        <Animated.View 
          entering={FadeInUp.duration(600).delay(300).springify()}
          style={styles.tipCard}
        >
          <Typo style={styles.tipText}>
            ⚠️ This step sets your device's volume as the **reference point** for the entire hearing test. Do not change your phone's volume after this!
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
  headerContainer: {
    alignItems: "center",
    marginTop: spacingY._20,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: scale(32),
    color: colors.primaryDark,
    fontWeight: "800",
    marginBottom: spacingY._25,
    letterSpacing: -0.5,
  },
  instructionCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
    padding: spacingY._20,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  instructionTitle: {
    fontSize: scale(16),
    fontWeight: "700",
    color: colors.primaryDark,
    marginBottom: spacingY._15,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacingY._10,
  },
  bullet: {
    fontSize: scale(15),
    fontWeight: "700",
    color: colors.primary,
    marginRight: spacingX._10,
    width: scale(20),
  },
  instructionText: {
    flex: 1,
    fontSize: scale(15),
    color: colors.neutral700,
    lineHeight: scale(22),
    fontWeight: "500",
  },
  playBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius._20,
    paddingVertical: verticalScale(20),
    paddingHorizontal: spacingX._40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacingX._10,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: scale(220),
  },
  playBtnActive: {
    backgroundColor: colors.primaryAccent,
  },
  playIcon: {
    fontSize: scale(20),
  },
  playText: {
    color: colors.white,
    fontSize: scale(18),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  playingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacingY._20,
    gap: spacingX._10,
  },
  waveBar: {
    width: 4,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.6,
  },
  waveBarDelay: {
    height: 30,
  },
  waveBarDelay2: {
    height: 25,
  },
  playingText: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: "600",
    marginLeft: spacingX._5,
  },
  continueBtn: {
    backgroundColor: colors.secondaryAccent,
    borderRadius: radius._15,
    paddingVertical: verticalScale(16),
    paddingHorizontal: spacingX._30,
    alignItems: "center",
    elevation: 3,
    shadowColor: colors.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.primary + "30",
  },
  continueText: {
    color: colors.text,
    fontSize: scale(17),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  tipCard: {
    backgroundColor: colors.primary + "10",
    borderRadius: radius._12,
    padding: spacingY._15,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacingY._10,
  },
  tipText: {
    fontSize: scale(13),
    color: colors.neutral700,
    textAlign: "center",
    lineHeight: scale(20),
    fontWeight: "600",
  },
});