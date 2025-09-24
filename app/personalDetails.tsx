import PrimaryButton from "@/components/PrimaryButton";
import TextFieldWrapper from "@/components/TextfieldWrapper";
import COLORS from "@/constants/Colors";
import { useSignupForm } from "@/context/signupContext";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import MyDropdown from "@/components/ui/MyDropdown";
import Constants from "expo-constants";
import { router } from "expo-router";

const pscgApi = Constants.expoConfig?.extra?.PSGC_API;

const PersonalDetailsScreen = () => {
  const [errorMsg, setErrorMsg] = useState("This is an error message");

  const { formData, setFormData } = useSignupForm();

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${pscgApi}/regions`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setRegions(formatted);
      })
      .catch((err) => console.error("Error fetching regions:", err));
  }, []);

  useEffect(() => {
    if (!selectedRegion) return;

    fetch(`${pscgApi}/regions/${selectedRegion}/provinces`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setProvinces(formatted);
        setSelectedProvince(null); // reset when region changes
      })
      .catch((err) => console.error("Error fetching provinces:", err));
  }, [selectedRegion]);

  useEffect(() => {
    if (!selectedProvince) return;

    fetch(`${pscgApi}/provinces/${selectedProvince}/cities-municipalities`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setCities(formatted);
        setSelectedCity(null); // reset when province changes
      })
      .catch((err) => console.error("Error fetching cities:", err));
  }, [selectedProvince]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.stepIndicator}>Step 2 of 4</Text>
          <Text style={styles.header}>Let's Get to Know You.</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextFieldWrapper label="First Name">
            <TextInput
              style={styles.textbox}
              placeholder=""
              onChangeText={(firstName) =>
                setFormData({ ...formData, first_name: firstName })
              }
              value={formData.first_name}
            />
          </TextFieldWrapper>

          <TextFieldWrapper label="Last Name">
            <TextInput
              style={styles.textbox}
              placeholder=""
              onChangeText={(lastName) =>
                setFormData({ ...formData, last_name: lastName })
              }
              value={formData.last_name}
            />
          </TextFieldWrapper>

          <TextFieldWrapper label="Phone Number">
            <TextInput
              style={styles.textbox}
              placeholder=""
              keyboardType="phone-pad"
              onChangeText={(phoneNum) =>
                setFormData({ ...formData, phone_number: phoneNum })
              }
              value={formData.phone_number}
            />
          </TextFieldWrapper>

          <View style={styles.addressContainer}>
            <TextFieldWrapper isFlex={true} label="Region">
              <MyDropdown
                dropdownItems={regions}
                onChange={(value, label) => {
                  setSelectedRegion(value);

                  setFormData({
                    ...formData,
                    region: value,
                    region_name: label as string,
                  });

                  setSelectedProvince(null);
                  setSelectedCity(null);
                }}
                placeholder="Region"
                value={selectedRegion as string}
              />
            </TextFieldWrapper>
            <TextFieldWrapper isFlex={true} label="Province">
              <MyDropdown
                isDisabled={!selectedRegion}
                dropdownItems={provinces}
                onChange={(value, label) => {
                  setSelectedProvince(value);

                  setFormData({
                    ...formData,
                    province: value,
                    province_name: label as string,
                  });

                  setSelectedCity(null);
                }}
                placeholder="Province"
                value={selectedProvince as string}
              />
            </TextFieldWrapper>
            <TextFieldWrapper isFlex={true} label="City">
              <MyDropdown
                isDisabled={!selectedProvince}
                dropdownItems={cities}
                onChange={(value, label) => {
                  setSelectedCity(value);

                  setFormData({
                    ...formData,
                    municipality: value,
                    municipality_name: label as string,
                  });
                }}
                placeholder="City"
                value={selectedCity as string}
              />
            </TextFieldWrapper>
          </View>
        </View>

        <View>
          <PrimaryButton
            title={"Next"}
            clickHandler={() => {
              proceedToStepThree(
                formData.first_name,
                formData.last_name,
                formData.phone_number
              );
            }}
          />
          {/* <ButtonSeparator />
          <SecondaryButton
            title={"Continue with Google"}
            clickHandler={() => {}}
          /> */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: "5%",
    paddingVertical: 25,
    gap: 8,
  },
  headerContainer: {
    gap: 0,
  },
  stepIndicator: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: COLORS.gray,
    fontWeight: 800,

    height: "auto",
  },
  header: {
    fontSize: 16,
    fontFamily: "Poppins",
    color: COLORS.black,
  },
  errorMsgContainer: {
    padding: 15,

    backgroundColor: COLORS.errorText,
    borderRadius: 5,
  },
  errorMessage: {
    fontSize: 12,
    fontFamily: "Poppins",
    letterSpacing: 0.7,
    color: COLORS.white,
  },
  logoImage: {
    width: 150,
    height: 100,
  },
  inputContainer: {
    flex: 1,
    gap: 0,
  },
  textbox: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,

    paddingVertical: 5,
    paddingHorizontal: 15,

    fontSize: 18,
  },
  addressContainer: {
    flex: 1,

    gap: 10,
    flexDirection: "row",
  },
});

const isDataValid = (firstName: string, lastName: string, phoneNum: string) => {
  if (
    !firstName ||
    firstName.trim().length === 0 ||
    !lastName ||
    lastName.trim().length === 0 ||
    !phoneNum ||
    phoneNum.trim().length === 0
  ) {
    Alert.alert("Missing input", "Please fill all the required fields");
    return false;
  }

  return true;
};

const proceedToStepThree = (
  firstName: string,
  lastName: string,
  phoneNum: string
) => {
  if (isDataValid(firstName, lastName, phoneNum)) {
    router.push("/credentials");
  }
};

export default PersonalDetailsScreen;
