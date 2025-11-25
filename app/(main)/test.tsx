import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Typo from "@/components/Typo";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function TestScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper showPattern>
      <View style={styles.container}>
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={styles.headerContainer}
        >
          <Typo style={styles.header}>Hearing Test</Typo>
          <Typo style={styles.subtext}>
            Choose an option to begin. Make sure you're in a quiet environment.
          </Typo>
        </Animated.View>

        <View style={styles.contentContainer}>
          {/* <AnimatedTouchable
            entering={FadeInDown.duration(600).delay(100).springify()}
            style={styles.btnSecondary}
            onPress={() => router.push(("/(main)/calibrate") as any)}
            activeOpacity={0.8}
          >
            <Typo style={styles.btnTextSecondary}>Calibrate Headphones</Typo>
          </AnimatedTouchable>

          <Animated.View 
            entering={FadeInDown.duration(600).delay(200).springify()}
            style={styles.dividerContainer}
          >
            <View style={styles.divider} />
            <Typo style={styles.dividerText}>or start directly</Typo>
            <View style={styles.divider} />
          </Animated.View> */}

          <View style={styles.earButtons}>
            <AnimatedTouchable
              entering={FadeInDown.duration(600).delay(300).springify()}
              style={styles.btnPrimary}
              onPress={() => router.push(({ pathname: "/(main)/testflow", params: { ear: "left" } }) as any)}
              activeOpacity={0.85}
            >
              <Typo style={styles.btnTextPrimary}>Start Test (Left Ear)</Typo>
            </AnimatedTouchable>

            <AnimatedTouchable
              entering={FadeInDown.duration(600).delay(400).springify()}
              style={styles.btnPrimary}
              onPress={() => router.push(({ pathname: "/(main)/testflow", params: { ear: "right" } }) as any)}
              activeOpacity={0.85}
            >
              <Typo style={styles.btnTextPrimary}>Start Test (Right Ear)</Typo>
            </AnimatedTouchable>
          </View>
        </View>

        <Animated.View 
          entering={FadeInUp.duration(600).delay(500).springify()}
          style={styles.infoCard}
        >
          <Typo style={styles.infoText}>
            💡 Tip: Use headphones and find a quiet space for accurate results
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  header: {
    fontSize: scale(32),
    fontWeight: "800",
    color: colors.primaryDark,
    marginBottom: spacingY._10,
    letterSpacing: -0.5,
  },
  subtext: {
    textAlign: "center",
    color: colors.neutral600,
    fontSize: scale(15),
    lineHeight: scale(22),
    paddingHorizontal: spacingX._15,
    fontWeight: "500",
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius._15,
    paddingVertical: verticalScale(16),
    paddingHorizontal: spacingX._30,
    alignItems: "center",
    marginVertical: spacingY._7,
    width: "100%",
    maxWidth: scale(320),
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  btnTextPrimary: {
    color: colors.white,
    fontSize: scale(17),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  btnSecondary: {
    backgroundColor: colors.secondaryAccent,
    borderRadius: radius._15,
    paddingVertical: verticalScale(14),
    paddingHorizontal: spacingX._30,
    alignItems: "center",
    marginBottom: spacingY._20,
    elevation: 2,
    shadowColor: colors.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.primary + "20",
  },
  btnTextSecondary: {
    color: colors.text,
    fontSize: scale(16),
    fontWeight: "700",
  },
  earButtons: {
    alignItems: "center",
    width: "100%",
    gap: spacingY._10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: spacingY._25,
    paddingHorizontal: spacingX._20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral400,
  },
  dividerText: {
    marginHorizontal: spacingX._15,
    fontSize: scale(13),
    color: colors.neutral600,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: colors.primary + "10",
    borderRadius: radius._12,
    padding: spacingY._15,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacingY._10,
  },
  infoText: {
    fontSize: scale(13),
    color: colors.neutral700,
    textAlign: "center",
    lineHeight: scale(20),
    fontWeight: "600",
  },
});