import { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, ThemeProvider, createTheme } from '@mui/material'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

interface FeatureByIdProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: iFeature, id?: string) => void;
    feature?: iFeature | null | undefined;
}

const FeatureById = ({ open, onClose, onSubmit, feature }: FeatureByIdProps) => {
  const [generatedId, setGeneratedId] = useState(() => {
    return crypto.randomUUID?.() ?? `feature-${Math.random().toString(36).slice(2, 10)}`
  })

  useEffect(() => {
    if (open && !feature?._id) {
      setGeneratedId(crypto.randomUUID?.() ?? `feature-${Math.random().toString(36).slice(2, 10)}`)
    }
  }, [open, feature?._id])

  const handleSubmit = () => {
    const nameInput = document.getElementById('feature-name') as HTMLInputElement;
    const descriptionInput = document.getElementById('feature-description') as HTMLInputElement;
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    if (!name) {
      alert('Feature name is required');
      return;
    }

    const payload = { name, description };

    if (feature?._id) {
      onSubmit({ ...feature, ...payload}, feature._id);
    } else {
      onSubmit({ key: generatedId, ...payload} as iFeature);
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog maxWidth="md" open={open} onClose={onClose}>
        <DialogTitle>{feature?.name ? "Update" : "Create"} Feature</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            id="feature-name"
            label="Feature Name"
            variant="filled"
            defaultValue={feature?.name || ''}
            fullWidth
          />
          <TextField
            id="feature-description"
            label="Feature Description"
            variant="filled"
            defaultValue={feature?.description || ''}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={handleSubmit} variant="contained">
            {feature?.name ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export default FeatureById