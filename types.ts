import { Router } from "expo-router";
import { ReactNode } from "react";
import { TextInput, TextInputProps, ViewStyle, TextStyle, TextProps, TouchableOpacityProps } from "react-native";

export type TypoProps = {
    size?: number;
    color?: string;
    fontWeight?: TextStyle['fontWeight'];
    style?: TextStyle;
    children: null | any;
    textProps?: TextProps;
}

export type ScreenWrapperProps = {
    style?: ViewStyle;
    children: React.ReactNode;
    isModal?: boolean;
    showPattern?: boolean;
    bgOpacity?: number;
}

export interface ButtonProps extends TouchableOpacityProps  {
    style?: ViewStyle;
    onPress: () => void;
    children: React.ReactNode;
    loading?: boolean;
} 