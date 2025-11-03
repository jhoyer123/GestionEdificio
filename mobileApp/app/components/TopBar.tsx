import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => {
            if (navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
          }}
        >
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.title}>
          {title ?? ""}
        </Text>
        <View style={styles.placeholder} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#fff",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
  },
  back: {
    width: 40,
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  placeholder: { width: 40 },
});
