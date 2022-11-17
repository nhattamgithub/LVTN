import { useState, useLayoutEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import DfinityAgentService from '../../auth/services/dfinityAgentService';

function SignInPage() {
  const [authClient, setAuthClient] = useState(undefined);

  useLayoutEffect(() => {
    (async () => {
      AuthClient.create().then(async client => {
        setAuthClient(client);
      });
    })();
  }, []);

  const handleLogin = async () => {
    await authClient?.login({
      identityProvider: process.env.II_URL,
      onSuccess: async () => {
        DfinityAgentService.login();
      },
      onError: error => {
        console.log(error);
      }
    });
  };

  function redirectUrl(url) {
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col flex-auto items-center sm:justify-center min-w-0">
      <Paper className="w-full sm:w-auto min-h-full sm:min-h-auto rounded-0 py-32 px-16 sm:p-48 sm:rounded-2xl sm:shadow">
        <div className="w-full max-w-320 sm:w-320 mx-auto sm:mx-0">
          <div className="items-center">
            <img style={{scale: '0.5'}} className="flex-auto mx-auto max-w-xs" src='images/logo/on_chain.svg' alt='on chain' />
          </div>
          <Typography className="mt-32 text-3xl font-extrabold tracking-tight leading-tight text-center" style={{color: '#46c2cb'}}>
            Triip Nền tảng du lịch kết nối du khách với người dân địa phương trên toàn thế giới
          </Typography>
          <div className="flex items-center">
            <img style={{scale: '0.7'}} className="flex-auto m-w" src="https://images.squarespace-cdn.com/content/v1/5930dc9237c5817c00b10842/1596257342082-BTLKZNZ393CL8BYLEHLL/81590491_1374280696075278_8529291419012038656_n.png" alt='logo' />
          </div>
          <div className="items-center">
            <img className="cursor-pointer mx-auto max-w-64" onClick={() => redirectUrl("https://www.youtube.com/watch?v=pe84UGSXOuk")} src="images/logo/youtube.png" alt="youtube" />
          </div>
          <div className="mt-24 text-lg tracking-tight leading-6 text-center" style={{color: '#46c2cb'}}>
            Cho phép tất cả mọi người với ý tưởng về một tour du lịch chia sẻ cuộc sống và câu chuyện cá nhân với khách du lịch. Tên của Triip chứa 2 chữ "i", 1 là cho các du khách và 1 là cho hướng dẫn viên địa phương.
          </div>
          <div className="flex items-center">
            <Button
              variant="contained"
              color="secondary"
              className="w-full mt-16 flex-auto"
              style={{color: '#ffffff'}}
              aria-label="Sign in"
              type="button"
              size="large"
              onClick={() => handleLogin()}
            >
              Sign in
            </Button>
          </div>
        </div>
      </Paper>
    </div>
  );
}

export default SignInPage;
