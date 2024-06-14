import PropTypes from "prop-types";
import DashboardLayout from "./dashboard";

// ----------------------------------------------------------------------

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function Layout({ children }) {
  return <DashboardLayout> {children} </DashboardLayout>;
}
