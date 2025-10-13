import React, { createContext, useContext, useState } from "react";

type FormDataType = {
  fname: string;
  lname: string;
  dateOfBirth: Date;
  gender: string;
  email: string;
  password: string;
};

type FormContextType = {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
};

const defaultValue: FormContextType = {
  formData: {
    fname: "",
    lname: "",
    dateOfBirth: new Date(),
    gender: "",
    email: "",
    password: "",
  },
  setFormData: () => {},
};

const FormContext = createContext<FormContextType>(defaultValue);

export const useChildSignupForm = () => useContext(FormContext);

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
