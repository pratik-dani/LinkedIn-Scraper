import { RHFTextField } from "../../components/hook-form";
import * as Yup from "yup";

export const PeopleSearchInput = () => {
  return (
    <RHFTextField
      type="text"
      name="searchUrl"
      label="LinkedIn People Search Url"
    />
  );
};

export const CountInput = () => {
  return (
    <RHFTextField
      type="number"
      name="totalCount"
      label="Total Count"
    />
  );
};

export const FormSchema = Yup.object().shape({
  taskName: Yup.string().required("account is required"),
  searchUrl: Yup.string().required("profiles are required"),
  totalCount: Yup.number().required("total count is required"),
  account: Yup.string().required("account is required"),
});

export const defaultValues = {
  taskName: "",
  searchUrl: "",
  totalCount: 100,
  account: "",
};

// export default {
//   PeopleSearchInput,
//   CountInput, 
// }
