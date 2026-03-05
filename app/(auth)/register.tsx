import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, spacingY, spacingX, radius } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Typo from "@/components/Typo";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import AntDesign from '@expo/vector-icons/AntDesign';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <ImageBackground
      source={require("@/assets/images/BG3.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Animated.View 
              entering={FadeInUp.duration(600).springify()}
              style={styles.headerSection}
            >
              <Typo style={styles.title}>Create Account</Typo>
              <Typo style={styles.subtitle}>Join us for a comprehensive hearing assessment</Typo>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.duration(600).delay(100).springify()}
              style={styles.formCard}
            >
              <View style={styles.inputWrapper}>
                <Typo style={styles.inputLabel}>Email</Typo>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.neutral500}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Typo style={styles.inputLabel}>Password</Typo>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a password"
                    placeholderTextColor={colors.neutral500}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Typo style={styles.eyeIcon}><AntDesign name={showPassword ? "eye" : "eye-invisible"} size={24} color={colors.white} /></Typo>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Typo style={styles.inputLabel}>Confirm Password</Typo>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.neutral500}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Typo style={styles.eyeIcon}><AntDesign name={showPassword ? "eye" : "eye-invisible"} size={24} color={colors.white} /></Typo>
                  </TouchableOpacity>
                </View>
              </View>

              <AnimatedTouchable 
                entering={FadeInDown.duration(600).delay(200).springify()}
                style={styles.registerBtn}
                activeOpacity={0.85}
              >
                <Typo style={styles.registerText}>Create Account</Typo>
              </AnimatedTouchable>

              <AnimatedTouchable 
                entering={FadeInDown.duration(600).delay(300).springify()}
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.7}
              >
                <Typo style={styles.linkText}>
                  Already have an account? <Typo style={styles.linkTextBold}>Login</Typo>
                </Typo>
              </AnimatedTouchable>
            </Animated.View>

            <AnimatedTouchable
              entering={FadeInUp.duration(600).delay(400).springify()}
              style={styles.skipBtn}
              onPress={() => router.replace("/(main)/frontpage")}
              activeOpacity={0.7}
            >
              <Typo style={styles.skipText}>Skip for now</Typo>
            </AnimatedTouchable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral900 + "CC", // Semi-transparent overlay
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: spacingY._30,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacingX._25,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: spacingY._30,
  },
  title: {
    fontSize: scale(34),
    color: colors.white,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacingY._10,
    letterSpacing: -0.5,
    textShadowColor: colors.neutral900,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.neutral300,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: scale(20),
    paddingHorizontal: spacingX._20,
  },
  formCard: {
    borderRadius: radius._20,
    padding: spacingY._25,
    elevation: 8,
    shadowColor: colors.neutral900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  inputWrapper: {
    marginBottom: spacingY._17,
  },
  inputLabel: {
    fontSize: scale(14),
    color: colors.neutral100,
    fontWeight: "600",
    marginBottom: spacingY._7,
  },
  input: {
    backgroundColor: colors.neutral900,
    color: colors.text,
    borderRadius: radius._12,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    fontSize: scale(15),
    borderWidth: 1.5,
    borderColor: colors.neutral300,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral900,
    borderRadius: radius._12,
    borderWidth: 1.5,
    borderColor: colors.neutral300,
  },
  passwordInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    fontSize: scale(15),
  },
  eyeButton: {
    padding: scale(10),
    paddingRight: scale(14),
  },
  eyeIcon: {
    fontSize: scale(18),
  },
  registerBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius._15,
    paddingVertical: verticalScale(16),
    alignItems: "center",
    marginTop: spacingY._10,
    marginBottom: spacingY._15,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  registerText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: scale(17),
    letterSpacing: 0.3,
  },
  linkText: {
    color: colors.neutral100,
    textAlign: "center",
    fontSize: scale(14),
    fontWeight: "500",
  },
  linkTextBold: {
    color: colors.primary,
    fontWeight: "300",
    textDecorationLine: "underline",
  },
  skipBtn: {
    alignItems: "center",
    marginTop: spacingY._25,
    paddingVertical: verticalScale(10),
    paddingHorizontal: spacingX._20,
    backgroundColor: colors.white + "20",
    borderRadius: radius._12,
    alignSelf: "center",
  },
  skipText: {
    color: colors.white,
    fontSize: scale(14),
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});