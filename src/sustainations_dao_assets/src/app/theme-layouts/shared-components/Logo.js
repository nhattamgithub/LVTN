import { styled } from '@mui/material/styles';

const Root = styled('div')(({ theme }) => ({
  '& > .logo-icon': {
    transition: theme.transitions.create(['width', 'height'], {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
}));

function Logo() {
  return (
    <Root className="flex items-center">
      <img className="logo-icon w-32 h-32" src="https://images.squarespace-cdn.com/content/v1/5930dc9237c5817c00b10842/1596257342082-BTLKZNZ393CL8BYLEHLL/81590491_1374280696075278_8529291419012038656_n.png" alt="logo" />

      <div
        className="flex items-center py-4 px-8 mx-8 rounded"
      >
        Triip
      </div>
    </Root>
  );
}

export default Logo;
