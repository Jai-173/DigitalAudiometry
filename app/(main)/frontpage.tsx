import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import Typo from "@/components/Typo";
import Animated, { FadeInDown, FadeInUp, FadeIn, FadeOut } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { MaterialIcons, AntDesign } from '@expo/vector-icons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function FrontPage() {
  const router = useRouter();
  const { user, logOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    Alert.alert(
      "Logout",
      "Are you sure you want to log out? You can skip login for now, but test results won't be saved.",
      [
        { text: "Cancel", onPress: () => { } },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logOut();
              router.replace("/(auth)/welcome");
            } catch (error) {
              Alert.alert("Error", "Failed to logout");
            }
          },
        },
      ]
    );
  };

  const ProfileImage = () => (
    user?.photoURL ? (
      <Image
        source={{ uri: user.photoURL }}
        style={styles.profileAvatar}
      />
    ) : (
      <View style={styles.defaultAvatar}>
        <MaterialIcons
          name="account-circle"
          size={scale(40)}
          color={colors.primary}
        />
      </View>
    )
  );

  return (
    <ScreenWrapper showPattern>
      <View style={styles.container}>

        {/* Profile Button */}
        <AnimatedTouchable
          style={styles.profileBtn}
          onPress={() => setShowProfileMenu(prev => !prev)}
          entering={FadeIn.delay(200)}
        >
          <ProfileImage />
        </AnimatedTouchable>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.profileMenu}
          >
            <View style={styles.menuHeader}>
              <Typo style={styles.menuHeaderText}>
                {user?.displayName || user?.email?.split('@')[0] || 'Guest'}
              </Typo>
              {user?.email && (
                <Typo style={styles.menuEmail}>{user.email}</Typo>
              )}
            </View>

            {user ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <View style={[styles.menuIconWrapper, styles.logoutIconWrapper]}>
                  <AntDesign name="logout" size={16} color={colors.red} />
                </View>
                <Typo style={styles.menuItemTextRed}>Logout</Typo>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowProfileMenu(false); router.replace("/(auth)/login"); }}
              >
                <View style={styles.menuIconWrapper}>
                  <MaterialIcons name="login" size={16} color={colors.primary} />
                </View>
                <Typo style={styles.menuItemText}>Login</Typo>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Hero Content */}
        <View style={styles.heroSection}>
          <Animated.Image
            entering={FadeInUp.duration(600).springify()}
            source={require("@/assets/images/Logo.png")}
            style={styles.heroImage}
          />

          <Animated.View
            entering={FadeInUp.duration(600).delay(100).springify()}
            style={styles.header}
          >
            <View style={styles.titleContainer}>
              <Typo style={styles.title}>Digital Audiometry</Typo>
              <View style={styles.titleUnderline} />
            </View>
            <Typo style={styles.subtitle}>Your hearing. Simplified.</Typo>
            {user && (
              <View style={styles.greetingContainer}>
                <Typo style={styles.userGreeting}>
                  Welcome back, {user.displayName || user.email?.split('@')[0]}! 
                </Typo>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <AnimatedTouchable
            entering={FadeInDown.duration(600).delay(200).springify()}
            style={styles.startBtn}
            onPress={() => router.push("/(main)/transducer")}
            activeOpacity={0.85}
          >
            <Typo style={styles.startText}>Start Test</Typo>
            <View style={styles.startBtnIcon}>
              <MaterialIcons name="arrow-forward" size={scale(20)} color={colors.white} />
            </View>
          </AnimatedTouchable>

          <AnimatedTouchable
            entering={FadeInDown.duration(600).delay(300).springify()}
            onPress={() => console.log("About section later")}
            style={styles.aboutBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="info-outline" size={scale(18)} color={colors.secondaryAccent} />
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
    justifyContent: "space-between",
    paddingTop: spacingY._50,
    paddingBottom: spacingY._30,
    paddingHorizontal: spacingX._25,
    position: 'relative',
  },

  // Profile Button & Avatar Styles
  profileBtn: {
    position: 'absolute',
    top: spacingY._50,
    right: spacingX._25,
    zIndex: 10,
    borderRadius: scale(22),
    backgroundColor: colors.white,
    elevation: 4,
    shadowColor: colors.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  defaultAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral50,
  },
  profileAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    borderWidth: 2.5,
    borderColor: colors.primary,
  },

  // Profile Menu Styles
  profileMenu: {
    position: 'absolute',
    top: spacingY._50 + scale(54),
    right: spacingX._25,
    width: scale(220),
    backgroundColor: colors.white,
    borderRadius: radius._15,
    elevation: 12,
    shadowColor: colors.neutral900,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    zIndex: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  menuHeader: {
    padding: spacingY._15,
    backgroundColor: colors.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  menuHeaderText: {
    fontSize: scale(15),
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: spacingY._5,
  },
  menuEmail: {
    fontSize: scale(11),
    fontWeight: '500',
    color: colors.neutral600,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingY._12,
    paddingHorizontal: spacingX._15,
    gap: spacingX._12,
  },
  menuIconWrapper: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconWrapper: {
    backgroundColor: colors.red + '12',
  },
  menuItemText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.primaryDark,
  },
  menuItemTextRed: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.red,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  heroImage: {
    width: "90%",
    height: verticalScale(240),
    resizeMode: "contain",
    marginBottom: spacingY._20,
  },

  // Header Styles
  header: {
    alignItems: "center",
    gap: spacingY._10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacingY._5,
  },
  title: {
    fontSize: scale(34),
    color: colors.primary,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.8,
    lineHeight: scale(40),
  },
  titleUnderline: {
    width: scale(80),
    height: 4,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 2,
    marginTop: spacingY._7,
  },
  subtitle: {
    fontSize: scale(17),
    color: colors.neutral600,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  greetingContainer: {
    marginTop: spacingY._15,
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    backgroundColor: colors.primary + '08',
    borderRadius: radius._20,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  userGreeting: {
    fontSize: scale(14),
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Button Styles
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: spacingY._17,
    paddingTop: spacingY._10,
  },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius._20,
    paddingVertical: verticalScale(18),
    paddingHorizontal: spacingX._30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    width: "100%",
    maxWidth: scale(320),
    gap: spacingX._10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  startText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: scale(18),
    letterSpacing: 0.5,
  },
  startBtnIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: scale(12),
    padding: scale(4),
  },
  aboutBtn: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: spacingX._20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._7,
    backgroundColor: colors.secondaryAccent + '08',
    borderRadius: radius._15,
    borderWidth: 1,
    borderColor: colors.secondaryAccent + '20',
  },
  aboutText: {
    color: colors.secondaryAccent,
    fontSize: scale(14),
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});