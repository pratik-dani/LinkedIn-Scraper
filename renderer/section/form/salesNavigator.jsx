import { RHFTextField } from "../../components/hook-form";
import * as Yup from "yup";

const SalesNavigatorInput = () => {
  return (
    <RHFTextField
      type="text"
      name="searchUrl"
      label="Search URL"
      //   multiline={false}
      //   rows={6}
    />
  );
};

export const FormSchema = Yup.object().shape({
  taskName: Yup.string().required("account is required"),
  searchUrl: Yup.string().required("post url is required"),
  account: Yup.string().required("account is required"),
});

export const defaultValues = {
  taskName: "",
  postUrl: "",
  account: "",
};

export default SalesNavigatorInput;
