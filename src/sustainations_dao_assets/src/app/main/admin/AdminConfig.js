import { authRoles } from "../../auth";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Admin = lazy(() => import("./Admin"));
const KYCs = lazy(() => import("./kycs/KYCs"));
const ApprovedKYCs = lazy(() => import("./kycs/ApprovedKYCs"));
const RejectedKYCs = lazy(() => import("./kycs/RejectedKYCs"));
const PendingKYCs = lazy(() => import("./kycs/PendingKYCs"));

const VerifyKYC = lazy(() => import("./kycs/kyc/VerifyKYC"));

const AdminConfig = {
  settings: {
    layout: {
      config: {}
    }
  },
  auth: authRoles.admin,
  routes: [
    {
      path: "admin",
      element: <Admin />,
      children: [
        {
          path: 'kycs',
          children: [
            {
              index: true,
              element: <KYCs />
            },
            {
              path: ':user_id/verify',
              element: <VerifyKYC />
            }
          ]
        },
        {
          path: 'approvedKYCs',
          children: [
            {
              index: true,
              element: <ApprovedKYCs />
            },
          ]
        },
        {
          path: 'rejectedKYCs',
          children: [
            {
              index: true,
              element: <RejectedKYCs />
            },
          ]
        },
        {
          path: 'pendingKYCs',
          children: [
            {
              index: true,
              element: <PendingKYCs />
            },
          ]
        },
      ]
    }
  ]
};

export default AdminConfig;
