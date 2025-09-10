import PrimaryButton from "@/components/PrimaryButton";
import Sidebar from "@/components/Sidebar";
import HorizontalLine from "@/components/ui/HorizontalLine";
import COLORS from "@/constants/Colors";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { uploadProfilePic } from "@/services/userService";
import { useAuthStore } from "@/stores/userAuthStore";
import * as ImagePicker from "expo-image-picker";

type userType = {
  email: string;
  fname: string;
  lname: string;
  phone_number: string;
};

const SettingScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // image upload functionalities
  const [image, setImage] = useState(user?.profile);
  const [error, setError] = useState("");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, camera roll permission is needed to upload."
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        const uri = result.assets[0].uri;

        setError(""); // clear any error first

        try {
          // try uploading
          const uploadedBase64 = await uploadProfilePic(uri);

          if (uploadedBase64) {
            setImage(uploadedBase64);
            updateUser({ profile: uploadedBase64 });

            Alert.alert("Success", "Profile picture updated!");
          } else {
            Alert.alert("Upload Failed", "Please try again.");
          }
        } catch (err) {
          console.error("Upload failed:", err);
          Alert.alert("Upload Failed", "Something went wrong.");
        }
      }
    }
  };

  const [fname, setFname] = useState(user?.fname || "");
  const [lname, setLname] = useState(user?.lname || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          <Text style={styles.header}>Settings</Text>
          <View style={styles.profileSettingsContainer}>
            <View style={styles.profileContainer}>
              <Image
                source={
                  image
                    ? { uri: image }
                    : require("../../assets/images/creeper.png")
                }
                style={styles.profile}
              />
              <View>
                <Text style={styles.profileLabel}>Profile Picture</Text>
                <Text style={styles.profileSublabel}>
                  PNG or JPEG under 15mb
                </Text>
              </View>
            </View>
            <View style={{ width: "35%" }}>
              <PrimaryButton
                title="Upload new photo"
                clickHandler={() => {
                  pickImage();
                }}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
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
                      (styles.inputContainer,
                      {
                        flexDirection: "row",
                        gap: 10,
                      })
                    }
                  >
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      placeholder="First Name"
                      value={fname}
                      onChangeText={setFname}
                    />
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      placeholder="Last Name"
                      value={lname}
                      onChangeText={setLname}
                    />
                  </View>
                </View>
                <View style={{ gap: 5 }}>
                  <Text style={styles.settingsSubheader}>Contact Details</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                    />
                    <TextInput
                      style={[styles.textInput, styles.disabledText]}
                      placeholder="Email"
                      value={email}
                      onChangeText={setEmail}
                      editable={false}
                    />
                  </View>
                </View>
                <PrimaryButton
                  title="Save Changes"
                  clickHandler={() => {
                    updateUser({
                      fname,
                      lname,
                      phoneNumber,
                      email,
                    });
                    Alert.alert("Success", "Profile updated!");
                  }}
                />
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
      </ScrollView>
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
  profile: { width: 100, height: 100, borderRadius: 50 },
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

    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,
  },
  disabledText: {
    backgroundColor: COLORS.lightGray,
  },
});

export default SettingScreen;
