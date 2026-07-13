import { Add, Close, GridView, HelpOutline, PlayCircleOutline } from '@mui/icons-material'
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControlLabel,
  IconButton, Stack, Typography
} from '@mui/material'

interface WelcomeDialogProps {
  open: boolean
  dontShowAgain: boolean
  onDontShowAgainChange: (checked: boolean) => void
  onClose: () => void
  onOpenGuide: () => void
  onAddStream: () => void
}

export function WelcomeDialog({ open, dontShowAgain, onDontShowAgainChange, onClose, onOpenGuide, onAddStream }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ position: 'relative', p: 3, pb: 1, background: 'radial-gradient(500px 180px at 0% 0%, rgba(63,185,80,.14), transparent 70%)' }}>
        <IconButton aria-label="Close welcome" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}><Close /></IconButton>
        <PlayCircleOutline sx={{ fontSize: 38, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Welcome to MultiviewGrid Web</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>A standalone multistream video wall that runs and saves directly in your browser.</Typography>
      </Box>
      <DialogContent>
        <Stack spacing={2.25}>
          <Box sx={{ display: 'flex', gap: 1.5 }}><Add color="primary" /><Box><Typography fontWeight={600}>Paste stream URLs</Typography><Typography variant="body2" color="text.secondary">Add one URL or several URLs on separate lines.</Typography></Box></Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}><GridView color="primary" /><Box><Typography fontWeight={600}>Arrange and save grids</Typography><Typography variant="body2" color="text.secondary">Drag, resize, use presets, and create multiple named grids. Saving is automatic.</Typography></Box></Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}><HelpOutline color="primary" /><Box><Typography fontWeight={600}>Help is always available</Typography><Typography variant="body2" color="text.secondary">Use the <strong>?</strong> button in the toolbar whenever you need the full guide.</Typography></Box></Box>
          <FormControlLabel control={<Checkbox checked={dontShowAgain} onChange={(event) => onDontShowAgainChange(event.target.checked)} />} label="Don't show this welcome again" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onOpenGuide}>How It Works</Button>
        <Button variant="contained" startIcon={<Add />} onClick={onAddStream}>Add My First Stream</Button>
      </DialogActions>
    </Dialog>
  )
}
