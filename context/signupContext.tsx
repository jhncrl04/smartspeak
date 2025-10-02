import React, { createContext, useContext, useState } from "react";

type FormDataType = {
  role: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
  creation_date: Date;
  province: string;
  province_name: string;
  municipality: string;
  municipality_name: string;
  region: string;
  region_name: string;
  barangay: string;
  barangay_name: string;
};

type FormContextType = {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
};

const defaultValue: FormContextType = {
  formData: {
    role: "",
    first_name: "jc",
    last_name: "servidad",
    phone_number: "09457880606",
    email: "albert@gmail.com",
    password: "johncarlo1",
    creation_date: new Date(),
    province: "",
    province_name: "",
    municipality: "",
    municipality_name: "",
    region: "",
    region_name: "",
    barangay: "",
    barangay_name: "",
  },
  setFormData: () => {},
};

const FormContext = createContext<FormContextType>(defaultValue);

export const useSignupForm = () => useContext(FormContext);

export const SignupFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [formData, setFormData] = useState<FormDataType>(defaultValue.formData);

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
};
