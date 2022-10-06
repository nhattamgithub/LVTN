import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import {
  Button,
  Box,
  Card,
  CardContent,
  Hidden
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { FormProvider } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';

const KycForm = (props) => {
  const { methods, submitLoading, onSubmit, cancelLink, showOwner } = props;
  const { control, formState, handleSubmit } = methods;
  const { isValid, errors } = formState;

  return (
    <Card className="w-full py-32 mx-auto rounded-2xl shadow">
      <CardContent>
        <FormProvider {...methods}>
          {showOwner && (
            <>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <div className="flex-1 mb-24">
                    <div className="flex items-center mt-16 mb-12">
                      <Typography className="font-semibold text-16 mx-8">User Name</Typography>
                    </div>
                    <TextField
                      disabled
                      {...field}
                      className="mt-8 mb-16"
                      error={!!errors.username}
                      helperText={errors?.username?.message}
                      id="username"
                      variant="outlined"
                      fullWidth
                    />
                  </div>
                )}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div className="flex-1 mb-24">
                    <div className="flex items-center mt-16 mb-12">
                      <Typography className="font-semibold text-16 mx-8">Phone</Typography>
                    </div>
                    <TextField
                      disabled
                      {...field}
                      className="mt-8 mb-16"
                      error={!!errors.phone}
                      helperText={errors?.phone?.message}
                      id="phone"
                      variant="outlined"
                      fullWidth
                    />
                  </div>
                )}
              />
            </>
          )}
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <div className="flex-1 mb-24">
                <div className="flex items-center mt-16 mb-12">
                  <Typography className="font-semibold text-16 mx-8">Address</Typography>
                </div>
                <TextField
                  disabled
                  {...field}
                  className="mt-8 mb-16"
                  error={!!errors.address}
                  helperText={errors?.address?.message}
                  id="name"
                  variant="outlined"
                  fullWidth
                />
              </div>
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex-1 mb-24">
                <div className="flex items-center mt-16 mb-12">
                  <Typography className="font-semibold text-16 mx-8">Status</Typography>
                </div>
                <TextField
                  disabled
                  {...field}
                  className="mt-8 mb-16"
                  error={!!errors.status}
                  helperText={errors?.status?.message}
                  id="name"
                  variant="outlined"
                  fullWidth
                />
              </div>
            )}
          />
          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <div className="flex-1 mb-24">
                <div className="flex items-center mt-16 mb-12">
                  <Typography className="font-semibold text-16 mx-8">Comments</Typography>
                </div>
                <TextField
                  {...field}
                  label="Comments"
                  className="mt-8 mb-16"
                  error={!!errors.comments}
                  helperText={errors?.comments?.message}
                  id="name"
                  variant="outlined"
                  fullWidth
                />
              </div>
            )}
          />
          <div className="flex">
            <Controller
              name="image"
              control={control}
              render={({ field: { onChange, value } }) => {
                if (!value || value === '') {
                  return null;
                }
                return (
                  <div className="relative flex-1">
                    <img style={{width: 30 + 'vw'}} src={value} className="w-full block" alt="KYC Image" />
                  </div>
                );
              }}
            />

            <Controller
              name="detected_objects"
              control={control}
              render={({ field: { value } }) => (
                <div className="mb-24 flex-1">
                  <div className="flex items-center mt-16 mb-12">
                    <Typography className="font-semibold text-16 mx-8">Auto-detected result:</Typography>
                  </div>
                  {value.map((obj, index) => 
                    <li key={index} className="mb-4">{obj}</li>
                  )}
                </div>
              )}
            />
          </div>
          
          <React.Fragment>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                variant="contained"
                to={cancelLink || '/admin/refill-brands'}
                component={Link}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <LoadingButton
                variant="contained" color="primary"
                disabled={!isValid}
                loading={submitLoading} onClick={handleSubmit(onSubmit)}
              >Submit</LoadingButton>
            </Box>
          </React.Fragment>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

export default KycForm;