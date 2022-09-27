import { authRoles } from "../../auth";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Admin = lazy(() => import("./Admin"));
const KYCs = lazy(() => import("./kycs/KYCs"));
// const NewRefillBrand = lazy(() => import("./refill-brands/brand/NewRefillBrand"));
const EditKyc = lazy(() => import("./kycs/kyc/EditKyc"));

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
            // {
            //   path: 'new',
            //   element: <NewRefillBrand />
            // },
            {
              path: ':kycId/edit',
              element: <EditKyc />
            }
          ]
        },
      ]
    }
  ]
};

export default AdminConfig;
