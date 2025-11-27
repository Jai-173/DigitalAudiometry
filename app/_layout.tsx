import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{}}
      />
      <Stack.Screen
        name="(auth)"
        options={{}}
      />
      <Stack.Screen
        name="(main)"
        options={{}}
      />
    </Stack>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});