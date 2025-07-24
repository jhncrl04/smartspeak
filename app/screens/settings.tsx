import PrimaryButton from "@/components/PrimaryButton";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";

const SettingScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
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
          <View>
            <HorizontalLine />
          </View>
          <View style={styles.mainSettingsContainer}>
            <View style={styles.settingsSubContainer}>
              <View style={{ gap: 5 }}>
                <Text style={styles.settingsSubheader}>
                  Personal Information
                </Text>
                <View
                  style={
                    (styles.inputContainer, { flexDirection: "row", gap: 10 })
                  }
                >
                  <TextInput
                    style={styles.textInput}
                    placeholder="First Name"
                  />
                  <TextInput style={styles.textInput} placeholder="Last Name" />
                </View>
              </View>
              <View style={{ gap: 5 }}>
                <Text style={styles.settingsSubheader}>Contact Details</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Phone Number"
                  />
                  <TextInput style={styles.textInput} placeholder="Email" />
                </View>
              </View>
              <PrimaryButton title="Save Changes" clickHandler={() => {}} />
            </View>
            <View
              style={{
                width: 0.3,
                height: "100%",
                backgroundColor: COLORS.gray,
              }}
            />
            <View style={styles.settingsSubContainer}>
              <View style={{ gap: 5 }}>
                <Text style={styles.settingsSubheader}>Change Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Old Password"
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="New Password"
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm Password"
                  />
                </View>
              </View>
              <PrimaryButton title="Save Password" clickHandler={() => {}} />
            </View>
          </View>
        </View>
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

  mainSettingsContainer: {
    flex: 1,
    flexDirection: "row",
  },
  settingsSubContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 20,
  },
  settingsSubheader: {
    fontSize: 16,
    fontFamily: "Poppins",
    fontWeight: 500,

    color: COLORS.black,
    textAlign: "center",
  },
  inputContainer: { gap: 10 },
  textInput: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: "100%",

    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default SettingScreen;
