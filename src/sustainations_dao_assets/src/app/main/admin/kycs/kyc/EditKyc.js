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
import linkAPI from '../../../../../api/flaskAPI';
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
  const { kycId } = routeParams;

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      address: '',
      phone: '',
      image: '',
      status: '',
      comments: '',
      approver: '',
      createdAt: '',
      updatedAt: '',
    },
    resolver: yupResolver(schema),
  });
  const { reset } = methods;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        axios.get(`${linkAPI}/get?id=${kycId}`).then((response) => {
          if (response.data) {
            console.log(response.data)
            const kyc = response.data;
            reset({
              username: kyc.username,
              address: kyc.address,
              phone: kyc.phone,
              image: kyc.image,
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
      name: data.name,
      phone: [data.phone],
      email: [data.email],
      address: [data.address],
      story: [data.story],
    }

    try {
      const result = await user.actor.updateRefillBrand(brandId, payload, [data.brandOwner], [data.ownerName]);
      if ("ok" in result) {
        dispatch(showMessage({ message: 'Success!' }));
        navigate('/admin/refill-brands');
      } else {
        throw result?.err;
      }
    } catch (error) {
      console.log(error);
      const message = {
        "NotAuthorized": "Please sign in!.",
        "AdminRoleRequired": 'Required admin role.',
        "Notfound": "Brand is not found."
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
