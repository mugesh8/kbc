import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  Box,
  IconButton
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';

const MemberSelectionDialog = ({ open, onClose, members, onSelectMember }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member =>
    member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.contact_no?.includes(searchTerm)
  );

  const handleSelectMember = (member) => {
    onSelectMember(member);
    setSearchTerm('');
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Select Member to Add Family Details
        </Typography>
        <IconButton onClick={handleClose} color="error">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder="Search members..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredMembers.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No members found"
                secondary={members.length === 0 ? "All members already have family details" : "Try adjusting your search"}
              />
            </ListItem>
          ) : (
            filteredMembers.map((member) => (
              <ListItem key={member.mid} disablePadding>
                <ListItemButton onClick={() => handleSelectMember(member)}>
                  <ListItemAvatar>
                    <Avatar
                      src={member.profile_image ? `${baseurl}/${member.profile_image}` : undefined}
                      sx={{ width: 40, height: 40 }}
                    >
                      {member.first_name?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.first_name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.contact_no}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberSelectionDialog;