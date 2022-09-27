import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import { lighten } from '@mui/material/styles';

const rows = [
  {
    id: 'uuid',
    align: 'left',
    disablePadding: false,
    label: '#',
  },
  {
    id: 'username',
    align: 'left',
    disablePadding: false,
    label: 'User Name',
  },
  {
    id: 'phone',
    align: 'left',
    disablePadding: false,
    label: 'Phone',
  },
  {
    id: 'address',
    align: 'left',
    disablePadding: false,
    label: 'Address',
  },
  {
    id: 'status',
    align: 'left',
    disablePadding: false,
    label: 'Status',
  },
  {
    id: 'comments',
    align: 'left',
    disablePadding: false,
    label: 'Comments',
  },
  {
    id: 'createdAt',
    align: 'left',
    disablePadding: false,
    label: 'Created At',
  },
  {
    id: 'updatedAt',
    align: 'left',
    disablePadding: false,
    label: 'Updated At',
  },
];

function KYCTableHead() {
  return (
    <TableHead>
      <TableRow className="h-48 sm:h-64">
        {rows.map((row) => {
          return (
            <TableCell
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? lighten(theme.palette.background.default, 0.4)
                    : lighten(theme.palette.background.default, 0.02),
              }}
              className="p-4 md:p-16"
              key={row.id}
              align={row.align}
              padding={row.disablePadding ? 'none' : 'normal'}
            >
              {row.label}
            </TableCell>
          );
        }, this)}
      </TableRow>
    </TableHead>
  );
}

export default KYCTableHead;
