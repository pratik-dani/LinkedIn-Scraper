import * as Yup from "yup";

export const FormSchema = Yup.object().shape({
  taskName: Yup.string().required("account is required"),
  profiles: Yup.string().required("profiles are required"),
  account: Yup.string().required("account is required"),
});

export const defaultValues = {
  taskName: "",
  profiles: "",
  account: "",
};

