import React, { createContext, useContext, useState } from "react";

type FormDataType = {
  role: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
  creation_date: Date;
};

type FormContextType = {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
};

const defaultValue: FormContextType = {
  formData: {
    role: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    creation_date: new Date(),
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
