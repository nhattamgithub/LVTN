import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

const VerifyKYC = () => {
  const [loading, setLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
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
      similar_faces: []
    },
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
              similar_faces: kyc.similar_faces
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

  const onReject = async (data) => {
    setRejectLoading(true);
    const status = "rejected";
    try {
      const response = await axios({
        method: "get",
        url: `${urlAPI}/update/kycstatus?id=${user_id}&status=${status}`,
      });
      const result = await user.actor.deleteKYC(user_id);
      if("ok" in result){
        console.log(result);
      } else {
        throw result?.err;
      }
      dispatch(showMessage({ message: 'Success!' }));
      navigate('/admin/kycs');
    } catch (error) {
      console.log(error);
      const message = {
        "NotAuthorized": "Please sign in!.",
        "AdminRoleRequired": 'Required admin role.',
        "AlreadyExisting": "KYC Already Existing."
      }[Object.keys(error)[0]] || 'Error! Please try again later!'
      dispatch(showMessage({ message }));
    };
    setRejectLoading(false);
  };

  const onApprove = async (data) => {
    setApproveLoading(true);
    const status = "approved";
    const payload = {
      username: data.username,
      address: data.address,
      phone: data.phone,
      image: data.image,
      approver: data.approver,
    }
    try {
      const response = await axios({
        method: "get",
        url: `${urlAPI}/update/kycstatus?id=${user_id}&status=${status}`,
      });
      const result = await user.actor.createKYC(user_id, payload);
      if("ok" in result){
        console.log(result);
      } else {
        throw result?.err;
      }
      dispatch(showMessage({ message: 'Success!' }));
      navigate('/admin/kycs');
    } catch (error) {
      console.log(error);
      const message = {
        "NotAuthorized": "Please sign in!.",
        "AdminRoleRequired": 'Required admin role.',
        "AlreadyExisting": "KYC Already Existing."
      }[Object.keys(error)[0]] || 'Error! Please try again later!'
      dispatch(showMessage({ message }));
    }
    setApproveLoading(false);
  };

  if (loading) {
    return <FuseLoading />;
  }

  return (
    <FusePageCarded
      header={<KycFormHeader actionText="Edit" />}
      content={<KycForm
        methods={methods} 
        approveLoading={approveLoading}
        rejectLoading={rejectLoading}
        onReject={onReject}
        onApprove={onApprove}
        showOwner={true}
      />}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default VerifyKYC;
