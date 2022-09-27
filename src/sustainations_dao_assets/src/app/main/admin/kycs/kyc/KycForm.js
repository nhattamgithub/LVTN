import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import {
  Button,
  Box,
  Card,
  CardContent
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { FormProvider } from 'react-hook-form';
import { Controller } from 'react-hook-form';

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
                      <Typography className="font-semibold text-16 mx-8">
                        <span className="text-red-500">*</span>&nbsp;User Name
                      </Typography>
                    </div>
                    <TextField
                      {...field}
                      label="User Name"
                      className="mt-8 mb-16"
                      error={!!errors.username}
                      required
                      helperText={errors?.username?.message}
                      autoFocus
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
                      <Typography className="font-semibold text-16 mx-8">
                        <span className="text-red-500">*</span>&nbsp;Phone
                      </Typography>
                    </div>
                    <TextField
                      {...field}
                      label="Phone"
                      className="mt-8 mb-16"
                      error={!!errors.phone}
                      required
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
                  <Typography className="font-semibold text-16 mx-8">
                    <span className="text-red-500">*</span>&nbsp;Address
                  </Typography>
                </div>
                <TextField
                  {...field}
                  label="Address"
                  className="mt-8 mb-16"
                  error={!!errors.address}
                  required
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
                  {...field}
                  label="Status"
                  className="mt-8 mb-16"
                  error={!!errors.status}
                  required
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
                  required
                  helperText={errors?.comments?.message}
                  id="name"
                  variant="outlined"
                  fullWidth
                />
              </div>
            )}
          />

          <Controller
            name="image"
            control={control}
            // render={({ field }) => (
            //   <div className="flex-1 mb-24">
            //     <div className="flex items-center mt-16 mb-12">
            //       <Typography className="font-semibold text-16 mx-8">KYC Image</Typography>
            //     </div>
            //     <Box
            //       component="img"
            //       alt="KYC Image"
            //       src={}
            //     />
            //   </div>
            // )}

            render={({ field: { onChange, value } }) => {
              if (!value || value === '') {
                return null;
              }
              return (
                <div className="relative">
                  <img style={{width: 30 + 'vw'}} src={value} className="w-full block" alt="note" />
                </div>
              );
            }}
          />
          
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