import { useContext } from "react";
import { MainContext } from "../context/mainContext";

export const useMain = () => useContext(MainContext);
