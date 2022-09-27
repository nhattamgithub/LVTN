import FuseUtils from "@fuse/utils";
import FuseLoading from "@fuse/core/FuseLoading";
import { Navigate } from "react-router-dom";
import settingsConfig from "app/configs/settingsConfig";
import SignInConfig from "../main/sign-in/SignInConfig";
import SignOutConfig from "../main/sign-out/SignOutConfig";
import Error404Page from "../main/404/Error404Page";
import UserAgreementConfig from "../main/user-agreement/UserAgreementConfig";
import UserAgreementsConfig from "../main/user-agreements/UserAgreementsConfig";
import AdminConfig from "../main/admin/AdminConfig";
import ProfileConfig from "../main/profile/ProfileConfig";
import Workspac3Config from '../main/workspac3/Workspac3Config';
import KycConfig from '../main/kyc/KycConfig';

const routeConfigs = [
  ...Workspac3Config,
  UserAgreementConfig,
  UserAgreementsConfig,
  SignOutConfig,
  SignInConfig,
  AdminConfig,
  ProfileConfig,
  KycConfig
];

const routes = [
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
  {
    path: "/",
    element: <Navigate to="/kyc" />,
    auth: settingsConfig.defaultAuth
  },
  {
    path: "loading",
    element: <FuseLoading />
  },
  {
    path: "404",
    element: <Error404Page />
  },
  {
    path: "*",
    element: <Navigate to="404" />
  }
];

export default routes;
