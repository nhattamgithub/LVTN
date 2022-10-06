import { useNavigate } from 'react-router-dom';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from '@lodash';
import { Controller, useForm } from 'react-hook-form';
import Box from '@mui/system/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { v4 as uuidv4 } from 'uuid';

import { useSelector, useDispatch } from "react-redux";
import { selectUser, setUser } from 'app/store/userSlice';
import QRCode from "react-qr-code";
import { setS3Object, deleteS3Object } from "../../hooks";
import { showMessage } from 'app/store/fuse/messageSlice';
import { useState, useEffect } from 'react';
import axios from "axios";

import KycMedia from './KycMedia';
import urlAPI from 'api/urlAPI';

const UpdateKYC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { principal } = user;
  const [kycInfo, setKycInfo] = useState({})

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        await axios.get(`${urlAPI}/getuser?id=${principal}`).then((response) => {
          setKycInfo(response.data);
        });
      } catch(error){
        console.log('There was an error!', error.response.data);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const currentImagePath = kycInfo.image;
  const imageUUID = currentImagePath ? currentImagePath.split("/")[2].split(".")[0] : uuidv4();
  console.log("KYC INFORRRRRRRRR",kycInfo)
  const { control, watch, handleSubmit, formState } = useForm({
    mode: 'onChange',
    defaultValues: {
      username : kycInfo.username,
      address : kycInfo.address,
      phone : kycInfo.phone,
      image: {
        id: imageUUID,
        base64data: kycInfo.image,
        path: currentImagePath
      },
    }
  });
  const image = watch('image');
  const { errors } = formState;
  const onSubmit = async (data) => {
    setLoading(true);
      const payload = {
        file : image.file,
        user_id : principal,
        username : data.username,
        address : data.address,
        phone : data.phone,
      }

    const formData = new FormData();
    for(const name in payload) {
      formData.append(name, payload[name]);
    }

    try {
      const response = await axios({
        method: "post",
        url: `${urlAPI}/kyc`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(showMessage({ message: 'Success!' }));
      navigate('/kyc');
    }
    catch(error) {
      console.log('There was an error!', error.response.data);
    }
    setLoading(false);
  };


  if (!user) {
    return (<FuseLoading />)
  }

  return (
    <div className="relative flex flex-col flex-auto items-center">
      <div className="w-full max-w-7xl">
        <Card className="w-full py-32 mx-auto mt-24 rounded-2xl shadow">
          <CardContent className="p-24 pt-0 sm:p-48 sm:pt-0">
            <div className="flex flex-auto items-end">
              <KycMedia control = {control} image = {image}/>
            </div>
            <Controller
              control={control}
              name="username"
              render={({ field }) => (
                <TextField
                  className="mt-32"
                  {...field}
                  label="Full name"
                  placeholder="Full name"
                  id="username"
                  error={!!errors.username}
                  helperText={errors?.username?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>account_circle_outlined</FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <TextField
                  className="mt-32"
                  {...field}
                  label="Phone"
                  placeholder="Phone"
                  id="phone"
                  error={!!errors.phone}
                  helperText={errors?.phone?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>call</FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({ field }) => (
                <TextField
                  className="mt-32"
                  {...field}
                  label="Address"
                  placeholder="Address"
                  id="address"
                  error={!!errors.address}
                  helperText={errors?.address?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>home</FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Box
              className="flex items-center mt-40 py-14 pr-16 pl-4 sm:pr-48 sm:pl-36 border-t"
            >
              <Button className="ml-auto" component={NavLinkAdapter} to={-1}>
                Cancel
              </Button>
              <LoadingButton
                className="ml-8"
                variant="contained"
                color="secondary"
                loading={loading}
                onClick={handleSubmit(onSubmit)}
              >
                Save
              </LoadingButton>
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UpdateKYC;