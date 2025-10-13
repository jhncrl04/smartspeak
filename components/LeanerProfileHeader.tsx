import COLORS from "@/constants/Colors";
import { Image, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton"; // Import the new SecondaryButton

type profileProps = {
  profile: string;
  name: string;
  age: number | null;
  screen: string;
  buttonHandler: () => void;
  onViewReports?: () => void; // New prop for viewing previous reports
};

const LearnerProfileHeader = (props: profileProps) => {
  return (
    <View style={styles.headerContainer}>
      {/* Top section with profile and name */}
      <View style={styles.profileSection}>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profile}
            source={
              props.profile
                ? { uri: props.profile }
                : require("@/assets/images/default.jpg")
            }
          />
        </View>
        <View style={styles.nameAgeContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {props.name}
          </Text>
          <Text style={styles.age}>
            {props.age ? props.age : "n/a"} Years Old
          </Text>
        </View>
      </View>

      {/* Button section */}
      <View style={styles.buttonSection}>
        {props.screen === "teacher" ? (
          <>
            <PrimaryButton
              title="Send Progress Report"
              clickHandler={props.buttonHandler}
            />
            <SecondaryButton
              title="View Previous Reports"
              clickHandler={props.onViewReports || (() => {})}
            />
          </>
        ) : (
          <>
            <PrimaryButton
              title="Edit Profile"
              clickHandler={props.buttonHandler}
            />
            <SecondaryButton
              title="View Previous Reports"
              clickHandler={props.onViewReports || (() => {})}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default LearnerProfileHeader;

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 30,

    flexDirection: "row",
  },
  profileSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileContainer: {
    borderColor: COLORS.gray,
    borderWidth: 2,
    borderRadius: 40,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profile: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nameAgeContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    color: COLORS.black,
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 20,
    lineHeight: 28,
  },
  age: {
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: "Poppins",
    fontWeight: "400",
  },
  buttonSection: {
    flex: 1,

    maxWidth: "40%",

    gap: 10,
  },
});
