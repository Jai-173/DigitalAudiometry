import React, { useRef } from "react";
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import Svg, { Line, Circle, Text as SvgText, Polyline, Rect } from "react-native-svg";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingY, spacingX, radius } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { scale, verticalScale } from "@/utils/styling";
import Entypo from '@expo/vector-icons/Entypo';
import { captureRef } from "react-native-view-shot";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get("window");
const CHART_WIDTH = width * 0.9;
const CHART_HEIGHT = 450;

const xPadding = 70;
const yPaddingTop = 30;
const yPaddingBottom = 40;

const FREQUENCIES = [125, 250, 500, 1000, 2000, 4000, 8000];
const DB_LEVELS = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

type ThresholdItem = { freq: number; dbLevel: number; ear?: string; type?: string };

export default function ResultsScreen() {
  const router = useRouter();

  const { leftResults, rightResults } = useLocalSearchParams<{
    leftResults?: string;
    rightResults?: string;
  }>();

  const screenShotRef = useRef<View>(null);

  let parsedLeft: ThresholdItem[] = [];
  let parsedRight: ThresholdItem[] = [];

  try {
    parsedLeft = leftResults ? JSON.parse(leftResults) : [];
    parsedRight = rightResults ? JSON.parse(rightResults) : [];
  } catch (err) {
    console.error("Error parsing results:", err);
  }

  const leftThresholds = parsedLeft.map((item) => ({
    freq: item.freq,
    db: Math.round(item.dbLevel),
    ear: item.ear || 'left',
  }));

  const rightThresholds = parsedRight.map((item) => ({
    freq: item.freq,
    db: Math.round(item.dbLevel),
    ear: item.ear || 'right',
  }));

  const showLeft = leftThresholds.length > 0;
  const showRight = rightThresholds.length > 0;

  const allThresholds = [
    ...leftThresholds.map(t => ({ ...t, ear: 'left' })),
    ...rightThresholds.map(t => ({ ...t, ear: 'right' }))
  ];

  const xScale = (freq: number) =>
    xPadding +
    (FREQUENCIES.indexOf(freq) / (FREQUENCIES.length - 1)) *
    (CHART_WIDTH - 2 * xPadding);

  const yScale = (db: number) =>
    yPaddingTop +
    ((110 - db) / 110) * (CHART_HEIGHT - yPaddingTop - yPaddingBottom);

  const chartTopY = yScale(-10);
  const chartBottomY = yScale(110);

  const avgThreshold =
    allThresholds.length > 0
      ? Math.round(allThresholds.reduce((sum, t) => sum + t.db, 0) / allThresholds.length)
      : 0;

  const getHearingLevel = (avg: number) => {
    if (avg <= 25) return { label: "Normal", color: colors.green };
    if (avg <= 40) return { label: "Mild Loss", color: colors.blue };
    if (avg <= 55) return { label: "Moderate Loss", color: colors.yellow };
    if (avg <= 70) return { label: "Moderately Severe", color: colors.orange };
    return { label: "Severe Loss", color: colors.red };
  };

  const hearingLevel = getHearingLevel(avgThreshold);

  const headerText = showLeft && showRight
    ? "Combined Audiogram Results"
    : showLeft
      ? "Left Ear Results"
      : showRight
        ? "Right Ear Results"
        : "Audiogram Results";
  // 2. Logic for sharing the screen content (graph + text results)
  const captureAndShareScreen = async () => {
    try {
      const uri = await captureRef(screenShotRef, {
        format: "png",
        quality: 1.0,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing unavailable", "Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Audiogram Results',
      });
    } catch (error) {
      console.error("Error capturing or sharing screen:", error);
      Alert.alert("Error", "Could not share results.");
    }
  };

  // 3. Logic for downloading/saving the screen content
  const captureAndDownloadScreen = async () => {
    try {
      const uri = await captureRef(screenShotRef, {
        format: "png",
        quality: 1.0,
      });

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Use Expo Sharing to prompt the user to save to photos (iOS/Android)
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Save Audiogram Results',
          UTI: 'public.png' // iOS specific
        });
        Alert.alert("Success", "The image has been saved to your device's photos/files.");

      } else {
        // For web/other platforms, show success message
        const filename = `Audiogram_Results_${Date.now()}.png`;
        Alert.alert("Success", `Results saved as ${filename}.`);
      }

    } catch (error) {
      console.error("Error capturing or downloading screen:", error);
      Alert.alert("Error", "Could not download results.");
    }
  };


  return (
    <ScreenWrapper showPattern>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View ref={screenShotRef} collapsable={false} style={styles.captureTarget}>
          <Animated.View
            entering={FadeInUp.duration(600).springify()}
            style={styles.headerSection}
          >
            <Typo style={styles.header}>
              {headerText}
            </Typo>

            <View style={[styles.statusCard, { borderLeftColor: hearingLevel.color }]}>
              <Typo style={styles.statusLabel}>Overall Hearing Status</Typo>
              <Typo style={{ ...styles.statusValue, color: hearingLevel.color }}>
                {hearingLevel.label}
              </Typo>
              <Typo style={styles.statusSubtext}>
                Average: {avgThreshold} dB HL (Combined)
              </Typo>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(100).springify()}
            style={styles.chartWrapper}
          >
            <View style={styles.chartHeader}>
              <Typo style={styles.chartTitle}>Audiogram</Typo>
              <View style={styles.legend}>
                {showLeft && (
                  <View style={styles.legendItem}>
                    {/* Left Ear Legend is Red X */}
                    <View style={[styles.legendMarker, styles.legendXRed]} />
                    <Typo style={styles.legendText}>Left Ear (X)</Typo>
                  </View>
                )}
                {showRight && (
                  <View style={styles.legendItem}>
                    {/* Right Ear Legend is Blue O */}
                    <View style={[styles.legendMarker, styles.legendCircleBlue]} />
                    <Typo style={styles.legendText}>Right Ear (O)</Typo>
                  </View>
                )}
              </View>
            </View>

            <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 40}>
              {/* Background */}
              <Rect
                x={xPadding}
                y={chartTopY}
                width={CHART_WIDTH - 2 * xPadding}
                height={chartBottomY - chartTopY}
                fill={colors.neutral100}
              />

              {/* Horizontal grid lines */}
              {DB_LEVELS.map((db) => (
                <Line
                  key={`grid-${db}`}
                  x1={xPadding}
                  y1={yScale(db)}
                  x2={CHART_WIDTH - xPadding}
                  y2={yScale(db)}
                  stroke={colors.neutral400}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              ))}

              {/* Vertical grid lines */}
              {FREQUENCIES.map((f) => (
                <Line
                  key={`vgrid-${f}`}
                  x1={xScale(f)}
                  y1={chartTopY}
                  x2={xScale(f)}
                  y2={chartBottomY}
                  stroke={colors.neutral400}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              ))}

              {/* Y-axis labels */}
              {DB_LEVELS.map((db) => (
                <SvgText
                  key={`ylabel-${db}`}
                  x={xPadding - 16} // Adjusted for better centering
                  y={yScale(db) + 4}
                  fontSize="12"
                  fill={colors.text}
                  textAnchor="end"
                  fontWeight="600"
                >
                  {db}
                </SvgText>
              ))}

              {/* X-axis labels */}
              {FREQUENCIES.map((f) => (
                <SvgText
                  key={`xlabel-${f}`}
                  x={xScale(f)}
                  y={CHART_HEIGHT + 20}
                  fontSize="12"
                  fill={colors.text}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {f}
                </SvgText>
              ))}

              {/* Axis titles (Adjusted X for better centering) */}
              <SvgText
                x={xPadding - 45} // Adjusted from 30/40
                y={CHART_HEIGHT / 2}
                fontSize="12"
                fill={colors.neutral600}
                textAnchor="middle"
                transform={`rotate(-90, ${xPadding - 45}, ${CHART_HEIGHT / 2})`}
                fontWeight="600"
              >
                Hearing Level (dB HL)
              </SvgText>

              <SvgText
                x={CHART_WIDTH / 2}
                y={CHART_HEIGHT + 35}
                fontSize="12"
                fill={colors.neutral600}
                textAnchor="middle"
                fontWeight="600"
              >
                Frequency (Hz)
              </SvgText>

              {/* Left Ear (Red X, Red Line) */}
              {showLeft && (
                <>
                  <Polyline
                    points={leftThresholds.map((p) => `${xScale(p.freq)},${yScale(p.db)}`).join(" ")}
                    fill="none"
                    stroke={colors.red}
                    strokeWidth="3"
                  />
                  {leftThresholds.map((p, i) => {
                    const cx = xScale(p.freq);
                    const cy = yScale(p.db);
                    const s = 7;
                    return (
                      <React.Fragment key={`left-${i}`}>
                        <Line
                          x1={cx - s}
                          y1={cy - s}
                          x2={cx + s}
                          y2={cy + s}
                          stroke={colors.red}
                          strokeWidth={3}
                          strokeLinecap="round"
                        />
                        <Line
                          x1={cx - s}
                          y1={cy + s}
                          x2={cx + s}
                          y2={cy - s}
                          stroke={colors.red}
                          strokeWidth={3}
                          strokeLinecap="round"
                        />
                      </React.Fragment>
                    );
                  })}
                </>
              )}

              {/* Right Ear (Blue O, Blue Line) */}
              {showRight && (
                <>
                  <Polyline
                    points={rightThresholds.map((p) => `${xScale(p.freq)},${yScale(p.db)}`).join(" ")}
                    fill="none"
                    stroke={colors.red} // Changed to standard audiogram color (Blue)
                    strokeWidth="3"
                  />
                  {rightThresholds.map((p, i) => (
                    <Circle
                      key={`right-${i}`}
                      cx={xScale(p.freq)}
                      cy={yScale(p.db)}
                      r="5"
                      stroke={colors.red} // Changed to Blue
                      strokeWidth="3"
                      fill={colors.neutral100}
                    />
                  ))}
                </>
              )}
            </Svg>
          </Animated.View>

          {/* Threshold details (simplified to show all combined data) */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(200).springify()}
            style={styles.detailsCard}
          >
            <Typo style={styles.detailsTitle}>Threshold Details</Typo>
            {allThresholds.map((t, idx) => (
              <View key={idx} style={styles.detailRow}>
                <Typo style={styles.detailFreq}>
                  {t.freq} Hz ({t.ear === 'left' ? 'L' : 'R'})
                </Typo>
                <View style={styles.detailBar}>
                  <View
                    style={[
                      styles.detailBarFill,
                      {
                        width: `${(t.db / 110) * 100}%`,
                        backgroundColor:
                          t.db <= 25
                            ? colors.primaryAccent
                            : t.db <= 40
                              ? colors.yellow
                              : colors.red,
                      },
                    ]}
                  />
                </View>
                <Typo style={styles.detailDb}>{t.db} dB</Typo>
              </View>
            ))}
          </Animated.View>
        </View>
        {/* End of content to capture */}

        {/* 5. Download Button */}
        <AnimatedTouchable
          entering={FadeInUp.duration(600).delay(300).springify()}
          style={styles.actionButton}
          onPress={captureAndDownloadScreen}
          activeOpacity={0.85}
        >
          <Typo style={styles.actionButtonText}><Entypo name="download" size={20} color={colors.white} /> Download Results</Typo>
        </AnimatedTouchable>

        {/* 6. Share Button */}
        <AnimatedTouchable
          entering={FadeInUp.duration(600).delay(350).springify()}
          style={styles.actionButton}
          onPress={captureAndShareScreen}
          activeOpacity={0.85}
        >
          <Typo style={styles.actionButtonText}><Entypo name="share" size={20} color={colors.white} /> Share Results</Typo>
        </AnimatedTouchable>

        {/* Other navigation buttons */}
        <AnimatedTouchable
          entering={FadeInUp.duration(600).delay(400).springify()}
          style={styles.secondaryButton}
          onPress={() => router.push("/(main)/test")}
          activeOpacity={0.85}
        >
          <Typo style={styles.secondaryButtonText}>Test Other Ear</Typo>
        </AnimatedTouchable>

        <AnimatedTouchable
          entering={FadeInUp.duration(600).delay(450).springify()}
          style={styles.secondaryButton}
          onPress={() => router.push("/(main)/frontpage")}
          activeOpacity={0.85}
        >
          <Typo style={styles.secondaryButtonText}><Entypo name="home" size={24} color="black" /> Back to Home</Typo>
        </AnimatedTouchable>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacingY._30,
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._50,
  },
  legendXRed: {
    position: "relative",
    borderWidth: 2,
    borderColor: colors.red,
    // Optional: Add styling to mimic an 'X' shape in the legend
    transform: [{ rotate: '45deg' }],
    
  },
  legendCircleBlue: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.red, // Changed to Blue
    backgroundColor: colors.neutral100,
  },
  // 7. Added style for the View to be captured
  captureTarget: {
    width: "100%",
    // backgroundColor: colors.neutral900, // Ensure background is set for the capture
    paddingHorizontal: spacingX._20, // Adjust padding if needed
    alignItems: 'center',
  },
  // ... (rest of your styles remain the same)

  headerSection: {
    alignItems: "center",
    width: "100%",
    marginBottom: spacingY._25,
  },
  header: {
    fontSize: scale(28),
    color: colors.primaryDark,
    fontWeight: "800",
    marginBottom: spacingY._20,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  statusCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
    padding: spacingY._20,
    width: "100%",
    alignItems: "center",
    borderLeftWidth: 5,
  },
  statusLabel: {
    fontSize: scale(14),
    color: colors.neutral600,
    fontWeight: "600",
    marginBottom: spacingY._5,
  },
  statusValue: {
    fontSize: scale(26),
    fontWeight: "800",
    marginBottom: spacingY._5,
    letterSpacing: -0.5,
  },
  statusSubtext: {
    fontSize: scale(13),
    color: colors.neutral600,
    fontWeight: "500",
  },
  chartWrapper: {
    backgroundColor: colors.white,
    borderRadius: radius._15,
    padding: spacingY._15,
    paddingLeft: 0,
    width: "100%",
    elevation: 3,
    shadowColor: colors.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: spacingY._20,
  },
  chartHeader: {
    marginBottom: spacingY._15,
    paddingLeft: spacingX._10,

  },
  chartTitle: {
    fontSize: scale(18),
    fontWeight: "700",
    color: colors.primaryDark,
    paddingLeft: spacingX._15,
    marginBottom: spacingY._10,
  },
  legend: {
    flexDirection: "row",
    gap: spacingX._15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
  },
  legendMarker: {
    width: 20,
    height: 20,
  },
  legendX: {
    position: "relative",
  },
  legendCircle: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.red,
    backgroundColor: colors.neutral100,
  },
  legendText: {
    fontSize: scale(12),
    color: colors.neutral600,
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
    padding: spacingY._20,
    width: "100%",
    marginBottom: spacingY._20,
  },
  detailsTitle: {
    fontSize: scale(16),
    fontWeight: "700",
    color: colors.primaryDark,
    marginBottom: spacingY._15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacingY._12,
    gap: spacingX._10,
  },
  detailFreq: {
    fontSize: scale(13),
    fontWeight: "600",
    color: colors.neutral700,
    width: scale(60),
  },
  detailBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral300,
    borderRadius: 4,
    overflow: "hidden",
  },
  detailBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  detailDb: {
    fontSize: scale(13),
    fontWeight: "700",
    color: colors.primaryDark,
    width: scale(55),
    textAlign: "right",
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius._15,
    paddingVertical: verticalScale(16),
    paddingHorizontal: spacingX._35,
    width: "100%",
    alignItems: "center",
    marginBottom: spacingY._12,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: scale(17),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: colors.secondaryAccent,
    borderRadius: radius._15,
    paddingVertical: verticalScale(14),
    paddingHorizontal: spacingX._30,
    width: "100%",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.primary + "30",
    marginBottom: spacingY._12, // Added spacing for multiple buttons
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: scale(16),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});