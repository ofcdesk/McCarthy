import { createContext, useContext, useMemo, useReducer } from "react"; // =================================================================================

// =================================================================================
const INITIAL_STATE = {
  selectedCompanyId: "",
  companyProjects: [],
  accProjects: [],
  companies: [],
};
const AppContext = createContext({
  state: INITIAL_STATE,
  dispatch: () => {},
});

const reducer = (state, action) => {
  switch (action.type) {
    case "COMPANIES_LIST_CHANGED": {
      return {
        ...state,
        companies: action.payload,
      };
    }

    case "SET_SELECTED_COMPANY": {
      return {
        ...state,
        selectedCompanyId: action.payload,
      };
    }

    case "COMPANY_PROJECTS_CHANGED": {
      return {
        ...state,
        companyProjects: action.payload,
      };
    }

    case "SET_ACC_PROJECTS": {
      return {
        ...state,
        accProjects: action.payload,
      };
    }

    default: {
      return state;
    }
  }
}; // =======================================================

// =======================================================
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch]
  );
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
export const useAppContext = () => useContext(AppContext);
export default AppContext;
