import { ThemedView } from "@/components/ThemedView";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { width } = Dimensions.get("window");
  const isTablet = width > 968;

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
    setPasswords({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSave = () => {
    // Add your save logic here
    console.log("Saving passwords:", passwords);
    setIsEditing(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={require("@/assets/images/arrow-left.png")}
            style={styles.image}
          />
        </TouchableOpacity>
      </View>

      {/* MAIN BODY */}
      <View style={[styles.body, isTablet ? styles.body : styles.bodyMobile]}>
        <View style={styles.layer1}>
          <View style={styles.ProfileContainer}>
            <Image
              source={require("@/assets/images/stock.jpg")}
              style={styles.ProfileImage}
            />
          </View>
        </View>

        <View style={styles.layer2}>
          <Text style={styles.LayerTitle}>Change Password</Text>

          <View style={styles.ParentInformationContainer}>
            <View style={styles.ParentInformation}>
              <Text
                style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}
              >
                Old Password
              </Text>
              <TextInput
                style={[styles.InputData, isEditing && styles.InputDataEditing]}
                secureTextEntry={true}
                editable={isEditing}
                value={passwords.oldPassword}
                onChangeText={(text) =>
                  setPasswords((prev) => ({ ...prev, oldPassword: text }))
                }
                placeholder={isEditing ? "Enter old password" : "••••••••"}
                placeholderTextColor={
                  isEditing ? "#434343" : "rgba(67, 67, 67, 0.7)"
                }
              />
            </View>

            <View style={styles.ParentInformation}>
              <Text
                style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}
              >
                New Password
              </Text>
              <TextInput
                style={[styles.InputData, isEditing && styles.InputDataEditing]}
                secureTextEntry={true}
                editable={isEditing}
                value={passwords.newPassword}
                onChangeText={(text) =>
                  setPasswords((prev) => ({ ...prev, newPassword: text }))
                }
                placeholder={isEditing ? "Enter new password" : "••••••••"}
                placeholderTextColor={
                  isEditing ? "#434343" : "rgba(67, 67, 67, 0.7)"
                }
              />
            </View>

            <View style={styles.ParentInformation}>
              <Text
                style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}
              >
                Confirm New Password
              </Text>
              <TextInput
                style={[styles.InputData, isEditing && styles.InputDataEditing]}
                secureTextEntry={true}
                editable={isEditing}
                value={passwords.confirmPassword}
                onChangeText={(text) =>
                  setPasswords((prev) => ({ ...prev, confirmPassword: text }))
                }
                placeholder={isEditing ? "Confirm new password" : "••••••••"}
                placeholderTextColor={
                  isEditing ? "#434343" : "rgba(67, 67, 67, 0.7)"
                }
              />
            </View>
          </View>
        </View>

        {/* Conditional button rendering */}
        {!isEditing ? (
          <TouchableOpacity style={styles.EditBtn} onPress={handleEdit}>
            <Text style={styles.BtnText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.ButtonContainer}>
            <TouchableOpacity style={styles.CancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.SaveBtn} onPress={handleSave}>
              <Text style={styles.BtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={styles.categoryInfos}
            onPress={() => router.push("../screens/learner/profile")}
          >
            <Image
              source={require("@/assets/images/user2.png")}
              style={styles.CategoryImage}
            />
            <Text
              style={styles.categoryText}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              Account Information
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryInfosActive}
            onPress={() => router.push("../screens/learner/changepass")}
          >
            <Image
              source={require("@/assets/images/lock.png")}
              style={styles.CategoryImage}
            />
            <Text
              style={styles.categoryText}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              Change Password
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: wp(3),
    height: hp(3.5),
    resizeMode: "contain",
  },
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  // HEADER STYLES
  header: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.5),
    backgroundColor: "#E5E5E5",
    height: hp(6),
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  // BODY STYLES
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bodyMobile: {
    marginBottom: hp(2),
  },

  // LAYER 1
  layer1: {
    width: wp(85),
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  ProfileContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: hp(1),
  },
  ProfileImage: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    resizeMode: "cover",
    marginRight: wp(1),
  },
  // LAYER 2
  layer2: {
    width: wp(85),
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
  },
  LayerTitle: {
    fontFamily: "Poppins",
    fontSize: wp(1.5),
    color: "#434343",
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  ParentInformationContainer: {},
  ParentInformation: {
    flex: 1,
    marginHorizontal: wp(1),
  },
  InputTitle: {
    fontFamily: "Poppins",
    fontSize: wp(1.2),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "400",
    letterSpacing: 0.5,
    textAlign: "center",
    marginVertical: hp(0.5),
  },
  InputTitleEditing: {
    color: "#434343",
    opacity: 1,
  },
  InputData: {
    fontFamily: "Poppins",
    fontSize: wp(1.2),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "500",
    letterSpacing: 0.5,
    borderRadius: wp(1),
    borderWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.7)",
    textAlign: "center",
    padding: wp(0.5),
    marginBottom: hp(0.5),
    justifyContent: "center",
    alignSelf: "center",
    width: wp(40),
    backgroundColor: "#fafafa",
  },
  InputDataEditing: {
    color: "#434343",
    opacity: 1,
    borderColor: "#434343",
    backgroundColor: "#fafafa",
  },
  EditBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(1),
    marginTop: hp(0.5),
  },
  ButtonContainer: {
    flexDirection: "row",
    gap: wp(2),
    marginTop: hp(0.5),
  },
  CancelBtn: {
    borderColor: "#9B72CF",
    borderWidth: 1,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(1),
  },
  SaveBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(1),
  },
  BtnText: {
    fontFamily: "Poppins",
    fontSize: wp(1.2),
    color: "#fafafa",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  cancelBtnText: {
    fontFamily: "Poppins",
    fontSize: wp(1.2),
    color: "#9B72CF",
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // FOOTER STYLES
  footer: {
    backgroundColor: "#E5E5E5",
    height: hp(8),
    justifyContent: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(1),
    minWidth: "100%",
  },
  CategoryImage: {
    borderRadius: wp(0.5),
    resizeMode: "contain",
    aspectRatio: 1,
    width: wp(2.5),
    height: hp(2.5),
  },
  categoryInfos: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: wp(0.5),
    paddingHorizontal: wp(2),
    borderRightWidth: 1,
    borderColor: "#9B72CF",
  },
  categoryInfosActive: {
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: hp(8),
    gap: wp(0.5),
    borderBottomLeftRadius: wp(1),
    borderBottomRightRadius: wp(1),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    borderRightWidth: 1,
    borderColor: "#9B72CF",
  },
  categoryText: {
    fontSize: wp(1.2),
    fontWeight: "500",
    color: "#9B72CF",
    marginTop: 0,
  },
});
