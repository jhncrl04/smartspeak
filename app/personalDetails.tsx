import PrimaryButton from "@/components/PrimaryButton";
import TextFieldWrapper from "@/components/TextfieldWrapper";
import COLORS from "@/constants/Colors";
import { useSignupForm } from "@/context/signupContext";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import MyDropdown from "@/components/ui/MyDropdown";
import { showToast } from "@/components/ui/MyToast";
import Constants from "expo-constants";
import { router } from "expo-router";
import PhoneInput, {
  ICountry,
  isValidPhoneNumber,
} from "react-native-international-phone-number";

const pscgApi = Constants.expoConfig?.extra?.PSGC_API;

const PersonalDetailsScreen = () => {
  const [errorMsg, setErrorMsg] = useState("This is an error message");

  const { formData, setFormData } = useSignupForm();

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);

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

        formatted.unshift({ label: "None", value: "" });
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

  useEffect(() => {
    if (!selectedCity) return;

    fetch(
      `${pscgApi}/provinces/${formData.province_name}/cities-municipalities/${formData.municipality_name}/barangays/`
    )
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((item: any) => ({
            label: item.name,
            value: item.code,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setBarangays(formatted);
        setSelectedBarangay(null); // reset when city changes
      })
      .catch((err) => console.error("Error fetching barangays:", err));
  }, [selectedCity]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.stepIndicator}>Step 2 of 4</Text>
          <Text style={styles.header}>Let's Get to Know You.</Text>
          <Text style={styles.subheader}>
            Required fields are marked with "*"
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextFieldWrapper label="First Name *" isFlex>
              <TextInput
                style={styles.textbox}
                placeholder=""
                onChangeText={(firstName) =>
                  setFormData({ ...formData, first_name: firstName })
                }
                value={formData.first_name}
              />
            </TextFieldWrapper>

            <TextFieldWrapper label="Last Name *" isFlex>
              <TextInput
                style={styles.textbox}
                placeholder=""
                onChangeText={(lastName) =>
                  setFormData({ ...formData, last_name: lastName })
                }
                value={formData.last_name}
              />
            </TextFieldWrapper>
          </View>

          <TextFieldWrapper label="Phone Number *`">
            <PhoneInput
              defaultCountry="PH"
              value={formData.phone_number}
              onChangePhoneNumber={(phoneNum) => {
                setFormData({ ...formData, phone_number: phoneNum });
              }}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={setSelectedCountry}
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
                    region: label !== "None" ? value : "",
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
            <TextFieldWrapper isFlex={true} label="Barangay">
              <MyDropdown
                isDisabled={!selectedProvince}
                dropdownItems={barangays}
                onChange={(value, label) => {
                  setSelectedBarangay(value);

                  setFormData({
                    ...formData,
                    barangay: value,
                    barangay_name: label as string,
                  });
                }}
                placeholder="Barangay"
                value={selectedBarangay as string}
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
                formData.phone_number,
                selectedCountry,
                formData.region,
                formData.province,
                formData.municipality,
                formData.barangay
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

const isDataValid = (
  firstName: string,
  lastName: string,
  phoneNum: string,
  country: ICountry | null,
  region: string,
  province: string,
  city: string,
  barangay: string
) => {
  if (
    !firstName ||
    firstName.trim().length === 0 ||
    !lastName ||
    lastName.trim().length === 0 ||
    !phoneNum ||
    phoneNum.trim().length === 0
  ) {
    showToast("error", "Missing input", "Please fill all the required fields.");
    return false;
  }

  if (!isValidPhoneNumber(phoneNum, country as ICountry)) {
    showToast(
      "error",
      "Invalid phone number",
      "Please check your phone number."
    );

    return false;
  }

  if (region !== "" && (province === "" || city === "" || barangay === "")) {
    showToast(
      "error",
      "Uncomplete Address",
      "Please complete your address or skip it"
    );

    return false;
  }

  return true;
};

const proceedToStepThree = (
  firstName: string,
  lastName: string,
  phoneNum: string,
  country: ICountry | null,
  region: string,
  province: string,
  city: string,
  barangay: string
) => {
  if (
    isDataValid(
      firstName,
      lastName,
      phoneNum,
      country,
      region,
      province,
      city,
      barangay
    )
  ) {
    router.push("/credentials");
  }
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
  phoneNumberContainer: {
    backgroundColor: "#ff0",
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
    fontWeight: 500,
    lineHeight: 20,
    color: COLORS.black,
  },
  subheader: {
    fontSize: 14,
    fontFamily: "Poppins",
    fontWeight: 600,
    color: COLORS.gray,
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
    gap: 5,
  },
  textbox: {
    backgroundColor: COLORS.pureWhite,

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

export default PersonalDetailsScreen;
