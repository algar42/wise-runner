import { configureStore } from "@reduxjs/toolkit";
import applicationReducer from "../features/application/applicationSlice";
import jobReducer from "../features/job/jobSlice";

export default configureStore({
  reducer: {
    application: applicationReducer,
    job: jobReducer,
  },
});
