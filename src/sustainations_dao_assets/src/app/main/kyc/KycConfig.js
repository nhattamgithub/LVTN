import { lazy } from "react";

const KYC = lazy(() => import("./KYC"));
const UpdateKYC = lazy(() => import("./UpdateKYC"));

const KycConfig = {
  settings: {
    layout: {}
  },
  routes: [
    {
      path: "kyc",
      element: <KYC />
    },
    {
      path: "kyc/update",
      element: <UpdateKYC />
    }
  ]
};

export default KycConfig;
