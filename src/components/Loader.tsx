import CloseIcon from '@mui/icons-material/Close';
import { CircularProgress, Dialog, DialogContent, IconButton, Typography } from '@mui/material';

type LoaderProps = {
  open: boolean;
  message?: string;
  onClose?: () => void;
};

export default function Loader({ open, message = 'Loading…', onClose }: LoaderProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 280 } } }}
    >
      <DialogContent
        sx={{
          position: 'relative',
          py: 4,
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
        className="bg-slate-900 text-white"
      >
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null}

        <CircularProgress />
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          {message}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
