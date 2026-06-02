import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material'

interface FeatureByIdProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string }, id?: string) => void;
    feature?: iFeature | null | undefined;
}

const FeatureById = ({ open, onClose, onSubmit, feature }: FeatureByIdProps) => {
  
  const handleSubmit = () => {
    const nameInput = document.getElementById('feature-name') as HTMLInputElement;
    const descriptionInput = document.getElementById('feature-description') as HTMLInputElement;
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    if (!name) {
      alert('Feature name is required');
      return;
    }
    onSubmit({ name, description }, feature?._id);
  }

  return (
    <Dialog maxWidth="md" open={open} onClose={onClose}>
        <DialogTitle>{feature?.name ? "Update" : "Create"} Feature</DialogTitle>
        <DialogContent className="w-[400px] flex flex-col gap-4">
            <TextField
                id="feature-name"
                label="Feature Name"
                variant="filled"
                defaultValue={feature?.name || ''}
            />
            <TextField
                id="feature-description"
                label="Feature Description"
                variant="filled"
                defaultValue={feature?.description || ''}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Close</Button>
            <Button onClick={handleSubmit} variant="contained">
                {feature?.name ? "Update" : "Create"}
            </Button>
        </DialogActions>
    </Dialog>
  )
}

export default FeatureById