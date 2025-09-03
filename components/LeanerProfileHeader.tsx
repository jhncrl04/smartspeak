import COLORS from "@/constants/Colors";
import { Image, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";

type profileProps = { name: string; age: number; screen: string };

const LearnerProfileHeader = (props: profileProps) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.pfpNameContainer}>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profile}
            source={require("../assets/images/creeper.png")}
          />
        </View>
        <View style={styles.nameAgeContainer}>
          <Text style={styles.name}>{props.name}</Text>
          <Text style={styles.age}>{props.age} Years Old</Text>
        </View>
      </View>

      <View style={styles.progressReportButtonContainer}>
        {props.screen === "teacher" ? (
          <PrimaryButton
            title="Send Progress Report"
            clickHandler={() => {
              console.log("send progress report");
            }}
          />
        ) : (
          <PrimaryButton
            title="Edit child profile"
            clickHandler={() => {
              console.log("send progress report");
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  pfpNameContainer: {
    flexDirection: "row",
    gap: 10,

    alignItems: "flex-end",
  },
  profileContainer: {
    borderColor: COLORS.gray,
    borderWidth: 2,
    borderRadius: 100,
  },
  profile: {
    width: 100,
    height: 100,

    borderRadius: 100,

    backgroundColor: COLORS.shadow,
  },
  nameAgeContainer: {
    flexDirection: "column",
  },
  name: {
    color: COLORS.black,

    fontFamily: "Poppins",
    fontWeight: "400",
    lineHeight: 25,

    fontSize: 18,
  },
  age: {
    color: COLORS.gray,
    fontSize: 14,
  },
  progressReportButtonContainer: {
    height: "30%",
    width: "35%",
  },
});

export default LearnerProfileHeader;
