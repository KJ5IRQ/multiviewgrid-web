import React, { useCallback, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton
} from '@mui/material'
import { Close, ContentCopy, Check } from '@mui/icons-material'
import { useStreamStore } from '../store/useStreamStore'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ open, onClose }) => {
  const getShareUrl = useStreamStore((s) => s.getShareUrl)
  const [copied, setCopied] = useState(false)

  const shareUrl = getShareUrl()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the text field content
      const input = document.querySelector<HTMLInputElement>('#share-url-input')
      if (input) {
        input.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }, [shareUrl])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#111', border: '1px solid rgba(255,255,255,0.1)' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>Share Grid</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.4)' }}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
            Share this URL to recreate your exact grid layout:
          </Typography>
          <TextField
            id="share-url-input"
            value={shareUrl}
            fullWidth
            multiline
            maxRows={3}
            variant="outlined"
            InputProps={{
              readOnly: true,
              sx: {
                color: '#56D364',
                fontSize: 12,
                fontFamily: 'monospace',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' }
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Close
        </Button>
        <Button
          onClick={handleCopy}
          variant="contained"
          startIcon={copied ? <Check /> : <ContentCopy />}
          sx={{
            bgcolor: copied ? '#2EA043' : '#3FB950',
            color: '#06120A',
            fontWeight: 600,
            '&:hover': { bgcolor: copied ? '#3FB950' : '#56D364' },
            '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
          }}
        >
          {copied ? 'Copied!' : 'Copy URL'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
