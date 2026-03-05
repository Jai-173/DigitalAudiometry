import Button from "@/components/Button";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { router, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const Welcome = () => {
    const router = useRouter();
  return (
    <ScreenWrapper showPattern={true}>
      <View style={styles.container}>

        <View style={styles.titleContainer}>
          <Typo color={colors.primary} size={43} fontWeight={"900"}>
            Audiometry
          </Typo>
        </View>

        <Animated.Image
          entering={FadeIn.duration(700).springify()}
          source={require('../../assets/images/splashImage.png')}
          style={styles.welcomeImage}
          resizeMode={"contain"}
        />

        <View style={styles.descriptionContainer}>
            <Typo color={colors.primary} size={26} fontWeight={'800'}>
                Your one-stop solution
            </Typo>
            <Typo color={colors.primary} size={26} fontWeight={'800'}>
             for comprehensive
            </Typo>
            <Typo color={colors.primary} size={26} fontWeight={'800'}>
                hearing assessments.
            </Typo>
        </View>

        <Button onPress={() => router.push("/(auth)/register")} style={{paddingHorizontal: spacingX._20, paddingVertical: spacingY._10, borderRadius: 12, backgroundColor: colors.primary}}>
            <Typo size={20} fontWeight={'bold'}>Get Started</Typo>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._10,
  },
  titleContainer: {
    alignItems: "center",
  },
  descriptionContainer: {
    alignItems: "center",
  },
  background: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  welcomeImage: {
    height: verticalScale(300),
    aspectRatio: 1,
    alignSelf: "center",
  },
});