import { RHFTextField } from "../../components/hook-form";
import * as Yup from "yup";

const CompanyInput = () => {
  return (
    <RHFTextField
      type="text"
      name="profiles"
      label="Profiles"
      multiline={true}
      rows={6}
    />
  );
};

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

export default CompanyInput;
