import React, { createContext, useContext, useState } from "react";

type FormDataType = {
  role: string;
  fname: string;
  lname: string;
  phoneNum: string;
  email: string;
  password: string;
};

type FormContextType = {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
};

const defaultValue: FormContextType = {
  formData: {
    role: "",
    fname: "",
    lname: "",
    phoneNum: "",
    email: "",
    password: "",
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
