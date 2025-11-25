import React from "react";
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import Svg, { Line, Circle, Text as SvgText, Polyline, Rect } from "react-native-svg";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingY, spacingX, radius } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { scale, verticalScale } from "@/utils/styling";
import Entypo from '@expo/vector-icons/Entypo';


const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get("window");
const CHART_WIDTH = width * 0.9;
const CHART_HEIGHT = 340;

const FREQUENCIES = [125, 250, 500, 1000, 2000, 4000, 8000];
const DB_LEVELS = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

export default function ResultsScreen() {
  const router = useRouter();
  const { results, ear } = useLocalSearchParams<{
    results?: string;
    ear?: string;
  }>();

  // Parse results with dbLevel (not volume)
  let parsed: { freq: number; dbLevel: number }[] = [];
  try {
    parsed = results ? JSON.parse(results) : [];
  } catch (err) {
    console.error("Error parsing results:", err);
  }

  // Use dbLevel directly
  const thresholds = parsed.map((item) => ({
    freq: item.freq,
    db: Math.round(item.dbLevel),
  }));

  const leftEarData = ear === "left" ? thresholds : [];
  const rightEarData = ear === "right" ? thresholds : [];

  const showLeft = leftEarData.length > 0;
  const showRight = rightEarData.length > 0;

  const xPadding = 40;
  const yPaddingTop = 15;
  const yPaddingBottom = 30;

  // X and Y scale functions
  const xScale = (freq: number) =>
    xPadding +
    (FREQUENCIES.indexOf(freq) / (FREQUENCIES.length - 1)) *
      (CHART_WIDTH - 2 * xPadding);

  // Higher dB = lower on graph
  const yScale = (db: number) =>
    yPaddingTop +
    ((110 - db) / 110) * (CHART_HEIGHT - yPaddingTop - yPaddingBottom);

  // Average dB threshold
  const avgThreshold =
    thresholds.length > 0
      ? Math.round(thresholds.reduce((sum, t) => sum + t.db, 0) / thresholds.length)
      : 0;

  // Hearing level classification (based on dB HL)
  const getHearingLevel = (avg: number) => {
    if (avg <= 25) return { label: "Normal", color: colors.green };
    if (avg <= 40) return { label: "Mild Loss", color: colors.blue };
    if (avg <= 55) return { label: "Moderate Loss", color: colors.yellow };
    if (avg <= 70) return { label: "Moderately Severe", color: colors.orange };
    return { label: "Severe Loss", color: colors.red };
  };

  const hearingLevel = getHearingLevel(avgThreshold);

  return (
    <ScreenWrapper showPattern>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInUp.duration(600).springify()}
          style={styles.headerSection}
        >
          <Typo style={styles.header}>
            {ear ? `${ear === "left" ? "Left" : "Right"} Ear Results` : "Audiogram Results"}
          </Typo>

          <View style={[styles.statusCard, { borderLeftColor: hearingLevel.color }]}>
            <Typo style={styles.statusLabel}>Hearing Status</Typo>
            <Typo style={{ ...styles.statusValue, color: hearingLevel.color }}>
              {hearingLevel.label}
            </Typo>
            <Typo style={styles.statusSubtext}>
              Average: {avgThreshold} dB HL
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
                  <View style={[styles.legendMarker, styles.legendX]} />
                  <Typo style={styles.legendText}>Left Ear (X)</Typo>
                </View>
              )}
              {showRight && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendMarker, styles.legendCircle]} />
                  <Typo style={styles.legendText}>Right Ear (O)</Typo>
                </View>
              )}
            </View>
          </View>

          <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 40}>
            {/* Background */}
            <Rect
              x={xPadding}
              y={yPaddingTop}
              width={CHART_WIDTH - 2 * xPadding}
              height={CHART_HEIGHT - yPaddingTop - yPaddingBottom}
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
                y1={yPaddingTop}
                x2={xScale(f)}
                y2={CHART_HEIGHT - yPaddingBottom}
                stroke={colors.neutral400}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            ))}

            {/* Y-axis labels */}
            {DB_LEVELS.map((db) => (
              <SvgText
                key={`ylabel-${db}`}
                x={xPadding - 12}
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

            {/* Axis titles */}
            <SvgText
              x={xPadding - 30}
              y={CHART_HEIGHT / 2}
              fontSize="12"
              fill={colors.neutral600}
              textAnchor="middle"
              transform={`rotate(-90, ${xPadding - 30}, ${CHART_HEIGHT / 2})`}
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

            {/* Left Ear */}
            {showLeft && (
              <>
                <Polyline
                  points={leftEarData.map((p) => `${xScale(p.freq)},${yScale(p.db)}`).join(" ")}
                  fill="none"
                  stroke={colors.red}
                  strokeWidth="3"
                />
                {leftEarData.map((p, i) => {
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

            {/* Right Ear */}
            {showRight && (
              <>
                <Polyline
                  points={rightEarData.map((p) => `${xScale(p.freq)},${yScale(p.db)}`).join(" ")}
                  fill="none"
                  stroke={colors.red}
                  strokeWidth="3"
                />
                {rightEarData.map((p, i) => (
                  <Circle
                    key={`right-${i}`}
                    cx={xScale(p.freq)}
                    cy={yScale(p.db)}
                    r="5"
                    stroke={colors.red}
                    strokeWidth="3"
                    fill={colors.neutral100}
                  />
                ))}
              </>
            )}
          </Svg>
        </Animated.View>

        {/* Threshold details */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(200).springify()}
          style={styles.detailsCard}
        >
          <Typo style={styles.detailsTitle}>Threshold Details</Typo>
          {thresholds.map((t, idx) => (
            <View key={idx} style={styles.detailRow}>
              <Typo style={styles.detailFreq}>{t.freq} Hz</Typo>
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

        {/* Buttons */}
        <AnimatedTouchable
          entering={FadeInUp.duration(600).delay(300).springify()}
          style={styles.actionButton}
          onPress={() => router.push("/(main)/test")}
          activeOpacity={0.85}
        >
          <Typo style={styles.actionButtonText}>Test Other Ear</Typo>
        </AnimatedTouchable>

        <AnimatedTouchable
          entering={FadeInUp.duration(600).delay(400).springify()}
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
  },
  chartTitle: {
    fontSize: scale(18),
    fontWeight: "700",
    color: colors.primaryDark,
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
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: scale(16),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
