import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import Typo from "@/components/Typo";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function FrontPage() {
  const router = useRouter();

  return (
    <ScreenWrapper showPattern>
      <View style={styles.container}>
        <Animated.Image
          entering={FadeInUp.duration(600).springify()}
          source={require("@/assets/images/Logo.png")}
          style={styles.heroImage}
        />

        <Animated.View 
          entering={FadeInUp.duration(600).delay(100).springify()}
          style={styles.header}
        >
          <Typo style={styles.title}>Digital Audiometry</Typo>
          <Typo style={styles.subtitle}>Your hearing. Simplified.</Typo>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <AnimatedTouchable
            entering={FadeInDown.duration(600).delay(200).springify()}
            style={styles.startBtn}
            onPress={() => router.push("/(main)/transducer")}
            activeOpacity={0.8}
          >
            <Typo style={styles.startText}>Start Test</Typo>
          </AnimatedTouchable>

          <AnimatedTouchable
            entering={FadeInDown.duration(600).delay(300).springify()}
            onPress={() => console.log("About section later")}
            style={styles.aboutBtn}
            activeOpacity={0.7}
          >
            <Typo style={styles.aboutText}>What is Digital Audiometry?</Typo>
          </AnimatedTouchable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: spacingY._50,
    paddingHorizontal: spacingX._25,
  },
  header: {
    alignItems: "center",
    gap: spacingY._7,
  },
  title: {
    fontSize: scale(32),
    color: colors.primary,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: scale(16),
    color: colors.neutral600,
    textAlign: "center",
    fontWeight: "500",
  },
  heroImage: {
    width: "85%",
    height: verticalScale(280),
    resizeMode: "contain",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: spacingY._15,
  },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius._15,
    paddingVertical: verticalScale(16),
    paddingHorizontal: spacingX._40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: "100%",
    maxWidth: scale(300),
  },
  startText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: scale(18),
    letterSpacing: 0.5,
  },
  aboutBtn: {
    paddingVertical: verticalScale(8),
  },
  aboutText: {
    color: colors.secondaryAccent,
    textDecorationLine: "underline",
    fontSize: scale(14),
    fontWeight: "600",
  },
});