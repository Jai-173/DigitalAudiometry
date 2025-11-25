// app/(main)/select-transducer.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SelectTransducer() {
  const router = useRouter();

  const goToCalibrate = (type: "air" | "bone") => {
    // push to calibrate and pass the selected transducer as a query param
    router.push(`/(main)/calibrate?transducer=${type}`);
  };

  return (
    <ScreenWrapper showPattern>
      <View style={styles.container}>
        <Animated.View
          entering={FadeInUp.duration(400).springify()}
          style={styles.header}
        >
          <Typo style={styles.title}>Choose transducer</Typo>
          <Typo style={styles.subtitle}>
            Select the device you’ll use for the hearing test.
          </Typo>
        </Animated.View>

        <View style={styles.options}>
          <AnimatedTouchable
            entering={FadeInDown.duration(400).delay(100).springify()}
            style={[styles.optionBtn, styles.airBtn]}
            activeOpacity={0.8}
            onPress={() => goToCalibrate("air")}
          >
            <Typo style={styles.optionTitle}>Air conduction</Typo>
            <Typo style={styles.optionSub}>Regular headphones / earphones</Typo>
          </AnimatedTouchable>

          <AnimatedTouchable
            entering={FadeInDown.duration(400).delay(200).springify()}
            style={[styles.optionBtn, styles.boneBtn]}
            activeOpacity={0.8}
            onPress={() => goToCalibrate("bone")}
          >
            <Typo style={styles.optionTitle}>Bone conduction</Typo>
            <Typo style={styles.optionSub}>Bone oscillator / bone headset</Typo>
          </AnimatedTouchable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: spacingX._25,
    paddingVertical: spacingY._30,
  },
  header: {
    alignItems: "center",
    gap: spacingY._7,
  },
  title: {
    fontSize: scale(24),
    color: colors.primary,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.neutral600,
    textAlign: "center",
    maxWidth: "85%",
  },
  options: {
    width: "100%",
    gap: spacingY._15,
    alignItems: "center",
  },
  optionBtn: {
    width: "100%",
    maxWidth: scale(360),
    paddingVertical: verticalScale(18),
    paddingHorizontal: spacingX._20,
    borderRadius: radius._12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  airBtn: {
    backgroundColor: colors.primary,
  },
  boneBtn: {
    backgroundColor: colors.primary,
  },
  optionTitle: {
    fontSize: scale(18),
    color: colors.white,
    fontWeight: "700",
  },
  optionSub: {
    marginTop: 6,
    fontSize: scale(13),
    color: colors.neutral600,
    fontWeight: "600",
  },
});
