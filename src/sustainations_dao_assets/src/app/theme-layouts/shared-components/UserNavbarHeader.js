import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { selectUser } from 'app/store/userSlice';
import QRCode from "react-qr-code";
import { fICP } from '../../utils/NumberFormat';

const Root = styled('div')(({ theme }) => ({
  '& .username, & .email': {
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },

  '& .avatar': {
    background: theme.palette.background.default,
    transition: theme.transitions.create('all', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
    bottom: 0,
    '& > img': {
      borderRadius: '50%',
    },
  },
}));

function UserNavbarHeader(_props) {
  const user = useSelector(selectUser);

  return (
    <Root className="user relative flex flex-col items-center justify-center p-16 pb-14 shadow-0">
      <div className="flex items-center justify-center mb-24 w-128 h-128">
        <img src='https://images.squarespace-cdn.com/content/v1/5930dc9237c5817c00b10842/1596257342082-BTLKZNZ393CL8BYLEHLL/81590491_1374280696075278_8529291419012038656_n.png' alt='triip-logo'></img>
      </div>
      <Typography className="username text-14 truncate font-medium text-center w-full">
        {fICP(user.balance)}
      </Typography>
    </Root>
  );
}

export default UserNavbarHeader;
