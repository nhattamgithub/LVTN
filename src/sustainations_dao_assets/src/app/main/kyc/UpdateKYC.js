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
import KycMedia from './KycMedia';


const UpdateKYC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [kycInfo, setKycInfo] = useState({
    userId : '',
    username : '',
    address : '',
    phone : '',
    image : '',
    status : '',
    comments : '',
    approver : '',
    createdAt : '',
    updatedAt : '',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await user.actor.getKYC();
      if("ok" in result) {
        setKycInfo(result.ok);

      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const currentImagePath = kycInfo.image;
  const imageUUID = currentImagePath ? currentImagePath.split("/")[2].split(".")[0] : uuidv4();

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
      username : data.username,
      address : data.address,
      phone : data.phone,
      image : image.base64data,
    }
    try {
      const result = await user.actor.createKYC(payload);
      if ("ok" in result) {
      //   let imageChanged;
      //   if (image.path) {
      //     imageChanged = await setS3Object({
      //       file: image.base64data,
      //       name: image.path
      //     });
      //   } else {
      //     imageChanged = await deleteS3Object(currentImagePath);
      //   }
      //   Promise.resolve(imageChanged).then(() => {
      //     const newUserState = {
      //       role: user.role,
      //       actor: user.actor,
      //       username: data.username,
      //       address: data.address,
      //       phone: data.phone,
      //       status: data.staus,
      //       comments: data.comments,
      //       principal: user.principal,
      //       avatar: user.avatar
      //     };
      //     dispatch(setUser(newUserState));
      //     dispatch(showMessage({ message: 'Success!' }));
        navigate('/kyc');
        // });
      } else {
        throw result?.err;
      }
    } catch (error) {
      console.log(error);
      const message = {
        "NotAuthorized": "Please sign in!."
      }[Object.keys(error)[0]] || 'Error! Please try again later!'
      dispatch(showMessage({ message }));
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
                  label="Username"
                  placeholder="Username"
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
                        <FuseSvgIcon size={20}>local_phone_outlined</FuseSvgIcon>
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
                        <FuseSvgIcon size={20}>local_phone_outlined</FuseSvgIcon>
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