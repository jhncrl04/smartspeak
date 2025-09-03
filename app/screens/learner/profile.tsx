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

  const { width } = Dimensions.get("window");
  const isTablet = width > 968;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fname: "Doe",
    mname: "J.",
    lname: "Elizabeth",
    dob: "03 - 15 - 1998",
    gender: "Female",
    pname: "Christine J. Doe",
    pnumber: "09123456789",
    studId: "202100123",
  });
  interface ProfileFormData {
    fname: string;
    mname: string;
    lname: string;
    dob: string;
    gender: string;
    pname: string;
    pnumber: string;
    studId: string;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
    setFormData({
      fname: "Doe",
      mname: "J.",
      lname: "Elizabeth",
      dob: "03 - 15 - 1998",
      gender: "Female",
      pname: "Christine J. Doe",
      pnumber: "09123456789",
      studId: "202100123",
    });
  };

  const handleSave = () => {
    // Add your save logic here
    console.log("Saving form data:", formData);
    setIsEditing(false);
  };

  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);
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
      <View style={styles.body}>
        <View style={styles.layer1}>
          <View style={styles.ProfileContainer}>
            <Image
              source={require("@/assets/images/stock.jpg")}
              style={styles.ProfileImage}
            />

            <View style={styles.ProfileTextContainer}>
              <Text style={styles.ProfileText}>Profile Picture</Text>
              <Text style={styles.ProfileSubText}>PNG, JPEG under 15mb</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.ChangeProfileBtn}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.BtnText}>Upload New Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.layer2}>
          <Text style={styles.LayerTitle}>Parent Information</Text>

          <View style={styles.ParentInformationContainer}>
            <View style={styles.ParentInformation}>
              <Text style={styles.InputTitle}>Name</Text>
              <Text style={styles.InputData}>{formData?.pname || ""}</Text>
            </View>

            <View style={styles.ParentInformation}>
              <Text style={styles.InputTitle}>Contact Number</Text>
              <Text style={styles.InputData}>{formData?.pnumber || ""}</Text>
            </View>
          </View>
        </View>

        <View style={styles.layer3}>
          <Text style={styles.LayerTitle}>Student Information</Text>

          <View style={styles.StudentInformationContainer}>
            <View style={styles.StudentInformation}>
              <Text
                style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}
              >
                First Name
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.InputData, styles.InputDataEditing]}
                  value={formData.fname}
                  onChangeText={(text) => updateFormData("fname", text)}
                />
              ) : (
                <Text style={styles.InputData}>{formData?.fname || ""}</Text>
              )}
            </View>

            <View style={styles.StudentInformation}>
              <Text
                style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}
              >
                Middle Name
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.InputData, styles.InputDataEditing]}
                  value={formData.mname}
                  onChangeText={(text) => updateFormData("mname", text)}
                />
              ) : (
                <Text style={styles.InputData}>{formData?.mname || ""}</Text>
              )}
            </View>

            <View style={styles.StudentInformation}>
              <Text
                style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}
              >
                Last Name
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.InputData, styles.InputDataEditing]}
                  value={formData.lname}
                  onChangeText={(text) => updateFormData("lname", text)}
                />
              ) : (
                <Text style={styles.InputData}>{formData?.lname || ""}</Text>
              )}
            </View>

            <View style={styles.StudentInformation}>
              <Text
                style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}
              >
                Date of Birth
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.InputData, styles.InputDataEditing]}
                  value={formData.dob}
                  onChangeText={(text) => updateFormData("dob", text)}
                  placeholder="MM - DD - YYYY"
                />
              ) : (
                <Text style={styles.InputData}>{formData?.dob || ""}</Text>
              )}
            </View>

            <View style={styles.StudentInformation}>
              <Text
                style={[
                  styles.InputTitle,
                  isEditing && styles.InputTitleEditing,
                ]}
              >
                Gender
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.InputData, styles.InputDataEditing]}
                  value={formData.gender}
                  onChangeText={(text) => updateFormData("gender", text)}
                />
              ) : (
                <Text style={styles.InputData}>{formData?.gender || ""}</Text>
              )}
            </View>

            <View style={styles.ParentInformation}>
              <Text style={styles.InputTitle}>Student ID</Text>

              <Text style={styles.InputData}>{formData?.studId || ""}</Text>
            </View>
          </View>
        </View>

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
            style={styles.categoryInfosActive}
            onPress={() => router.push("/profile")}
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
            style={styles.categoryInfos}
            onPress={() => router.push("/changepass")}
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
  // LAYER 1
  layer1: {
    width: wp(85),
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
    flexDirection: "row",
    justifyContent: "space-between",
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
  ProfileTextContainer: {
    marginTop: hp(0.5),
    justifyContent: "center",
  },
  ProfileText: {
    fontFamily: "Poppins",
    fontSize: wp(1.5),
    color: "#434343",
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  ProfileSubText: {
    fontFamily: "Poppins",
    fontSize: wp(1.2),
    color: "#434343",
    opacity: 0.7,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  ChangeProfileBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: wp(1),
  },
  BtnText: {
    fontFamily: "Poppins",
    fontSize: wp(1.2),
    color: "#fff",
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // LAYER 2
  layer2: {
    width: wp(85),
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
    borderBottomWidth: 1,
    borderColor: "rgba(67, 67, 67, 0.5)",
  },
  LayerTitle: {
    fontFamily: "Poppins",
    fontSize: wp(1.5),
    color: "#434343",
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  ParentInformationContainer: {
    flexDirection: "row",
  },
  ParentInformation: {
    flex: 1,
    marginHorizontal: wp(1),
  },
  StudentInformationContainer: {
    flexDirection: "row",
  },
  StudentInformation: {
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
    backgroundColor: "#fafafa",
  },
  InputDataEditing: {
    color: "#434343",
    opacity: 1,
    borderColor: "#434343",
    backgroundColor: "#fafafa",
  },

  // LAYER 3
  layer3: {
    width: wp(85),
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
  },

  EditBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(1),
    marginTop: hp(1),
  },
  ButtonContainer: {
    flexDirection: "row",
    gap: wp(2),
    marginTop: hp(1),
  },
  CancelBtn: {
    borderColor: "#9B72CF",
    borderWidth: 1,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(1),
  },
  cancelBtnText: {
    fontFamily: "Poppins",
    fontSize: wp(1.2),
    color: "#9B72CF",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  SaveBtn: {
    backgroundColor: "#9B72CF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(1),
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
