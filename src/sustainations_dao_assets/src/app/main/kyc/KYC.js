import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography
} from '@mui/material';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSelector } from "react-redux";
import { selectUser } from 'app/store/userSlice';
import QRCode from "react-qr-code";
import { useState, useEffect } from 'react';
import axios from "axios";

import HaventKYC from './HaventKYC';
import urlAPI from 'api/urlAPI';

const KYC = () => {
  const user = useSelector(selectUser);
  const { principal } = user;
  const [loading, setLoading] = useState(true)
  const [kycInfo, setKycInfo] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        await axios.get(`${urlAPI}/getuser?id=${principal}`).then((response) => {
          console.log("get by userID",response.data);
          setKycInfo(response.data);
        });
      } catch(error){
        console.log('There was an error!', error.response.data);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);
  

  if (!user) {
    return (<FuseLoading />)
  }

  if (!kycInfo) {
    return (<HaventKYC />)
  }

  return (
    <div className="relative flex flex-col flex-auto items-center">
      <div className="w-full max-w-7xl">
        <Card className="w-full py-32 mx-auto mt-24 rounded-2xl shadow">
          <CardContent className="p-24 pt-0 sm:p-48 sm:pt-0">
            <div className="flex flex-auto items-end">
              <Avatar
                sx={{
                  borderWidth: 4,
                  borderStyle: 'solid',
                  borderColor: 'background.paper',
                  backgroundColor: 'background.default',
                  color: 'text.secondary',
                }}
                className="w-128 h-128 text-64 font-bold"
                src={user.avatar}
                alt={user.username}
              >
              </Avatar>
              {/* <div className="flex items-center ml-auto mb-4">
                <Button variant="contained" color="secondary" component={NavLinkAdapter} to="update">
                  <FuseSvgIcon size={20}>edit_outlined</FuseSvgIcon>
                  <span className="mx-8">Update KYC Information</span>
                </Button>
              </div> */}
            </div>

            <Divider className="mt-16 mb-24" />

            <div className="flex flex-col space-y-32">
              <div className="flex items-center">
                <FuseSvgIcon>fingerprint_outlined</FuseSvgIcon>
                <div className="ml-24 leading-6">{user.principal}</div>
              </div>

              <div className="flex items-center">
                <FuseSvgIcon>account_circle</FuseSvgIcon>
                <div className="ml-24 leading-6">{kycInfo.username || "N/A"}</div>
              </div>

              <div className="flex items-center">
                <FuseSvgIcon>home</FuseSvgIcon>
                <div className="ml-24 leading-6">{kycInfo.address || "N/A"}</div>
              </div>

              <div className="flex items-center">
                <FuseSvgIcon>call</FuseSvgIcon>
                <div className="ml-24 leading-6">{kycInfo.phone || "N/A"}</div>
              </div>

              <div className="flex items-center">
                <FuseSvgIcon>security</FuseSvgIcon>
                <div className="ml-24 leading-6">{kycInfo.kycStatus || "N/A"}</div>
              </div>

              <div className="flex items-center">
                <FuseSvgIcon>notes</FuseSvgIcon>
                <div className="ml-24 leading-6">{kycInfo.comments || "N/A"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
};

export default KYC;