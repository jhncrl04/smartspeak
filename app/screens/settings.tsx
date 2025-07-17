import PrimaryButton from "@/components/PrimaryButton";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

const SettingScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={styles.container}>
      <Sidebar onNavigate={handleNavigation} />
      <View style={styles.settingsContainer}>
        <Text style={styles.header}>Settings</Text>
        <View style={styles.profileSettingsContainer}>
          <View style={styles.profileContainer}>
            <Image
              source={require("../../assets/images/creeper.png")}
              style={styles.profile}
            />
            <View>
              <Text style={styles.profileLabel}>Profile Picture</Text>
              <Text style={styles.profileSublabel}>PNG or JPEG under 15mb</Text>
            </View>
          </View>
          <View style={{ width: "35%" }}>
            <PrimaryButton title="Upload new photo" clickHandler={() => {}} />
          </View>
        </View>
        <View>
          <HorizontalLine />
        </View>
        <View></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  settingsContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 30,

    gap: 10,
  },
  header: {
    fontSize: 20,
    fontFamily: "Poppins",
    fontWeight: 500,

    color: COLORS.black,
    textAlign: "center",
  },
  profileSettingsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  profile: { width: 100, height: 100, borderRadius: "100%" },
  profileContainer: { flexDirection: "row", gap: 20, alignItems: "center" },
  profileLabel: {
    color: COLORS.black,
    fontSize: 16,
    lineHeight: 17,
    fontFamily: "Poppins",
    fontWeight: 500,
  },
  profileSublabel: { color: COLORS.gray, fontFamily: "Poppins" },
});

export default SettingScreen;
