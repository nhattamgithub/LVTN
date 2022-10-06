import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from "axios";

import { selectUser } from 'app/store/userSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FusePageCarded from '@fuse/core/FusePageCarded';
import FuseLoading from '@fuse/core/FuseLoading';
import KycFormHeader from './KycFormHeader';
import KycForm from './KycForm';
import _ from 'lodash';
import urlAPI from 'api/urlAPI';
import { Principal } from '@dfinity/candid/lib/cjs/idl';
/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  name: yup
    .string()
    .required('You must enter a brand name'),
  brandOwner: yup
    .string()
    .required('You must enter a brand owner'),
});

const EditKyc = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const dispatch = useDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const routeParams = useParams();
  const { user_id } = routeParams;

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      address: '',
      phone: '',
      image: '',
      detected_objects: [],
      status: '',
      comments: '',
      approver: '',
      createdAt: '',
      updatedAt: '',
    },
    // resolver: yupResolver(schema),
  });
  const { reset } = methods;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        axios.get(`${urlAPI}/getuser?id=${user_id}`).then((response) => {
          if (response.data) {
            console.log("GGGGGGGG",response.data)
            const kyc = response.data;
            reset({
              username: kyc.username,
              address: kyc.address,
              phone: kyc.phone,
              image: kyc.image,
              detected_objects: kyc.detected_objects,
              status: kyc.kycStatus,
              comments: kyc.comments,
              approver: kyc.approver,
              createdAt: kyc.createdAt,
              updatedAt: kyc.updatedAt,
            });
          } else {
            navigate('/404');
          }
        });
        
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    })();
  }, [user]);

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    const payload = {
      username: data.username,
      address: data.address,
      phone: data.phone,
      image: data.image,
      approver: data.approver,
    }

    try {
      const result = await user.actor.createKYC(user_id, payload);
      if ("ok" in result) {
        dispatch(showMessage({ message: 'Success!' }));
        navigate('/admin/kycs');
      } else {
        throw result?.err;
      }
    } catch (error) {
      console.log(error);
      const message = {
        "NotAuthorized": "Please sign in!.",
        "AdminRoleRequired": 'Required admin role.',
        "AlreadyExisting": "KYC Already Existing."
      }[Object.keys(error)[0]] || 'Error! Please try again later!'
      dispatch(showMessage({ message }));
    }
    setSubmitLoading(false);
  };

  if (loading) {
    return <FuseLoading />;
  }

  return (
    <FusePageCarded
      header={<KycFormHeader actionText="Edit" />}
      content={<KycForm
        methods={methods} submitLoading={submitLoading}
        onSubmit={onSubmit}
        showOwner={true}
      />}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default EditKyc;
