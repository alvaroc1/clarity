import * as React from 'react'
import { DialogActions, ListItemIcon, ListItemText, ListSubheader, Typography } from '@mui/material'
import { Cable } from '@mui/icons-material'
import Button from '@mui/joy/Button'
import Box from '@mui/joy/Box'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import ListItemContent from '@mui/joy/ListItemContent'
import TextField from '@mui/joy/TextField'
import { SettingsProps, SettingsEvent } from '../shared/SettingsWindow'
import { ManagedWindowComponent } from './ManagedWindowComponent'

class SettingsPage extends ManagedWindowComponent<SettingsProps, SettingsEvent, { port: number }> {
  state = {
    port: this.props.port
  }
  render() {
    const { port, error, onEvent, close } = this.props

    return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error &&
        <Box sx={{ color: 'red', fontFamily: 'sans-serif', textAlign: 'center', padding: '6px', fontSize: '14px' }}>
          {error}
        </Box>
      }
      <List sx={{ flex: 1 }}>
        <ListItem>
          <ListItemContent>TCP Port: </ListItemContent>
          <TextField size='sm' defaultValue={port} sx={{ width: 70 }}
            onChange={(ev) => this.setState({ port: parseInt(ev.target.value, 10) })} />
        </ListItem>
      </List>
      <Box
        sx={{
          display: 'flex',
          p: 2,
          borderTop: '1px solid',
          borderColor: 'background.level2',
          gap: 1,
          justifyContent: 'right'
        }}
      >
        <Button variant='plain' size='sm' onClick={close}>Cancel</Button>
        <Button variant='solid' size='sm'
          onClick={() => {
            close()
            onEvent({ port: this.state.port })
          }}>Apply</Button>
      </Box>
    </Box>

    /*
    return (
      <List
        sx={{
          width: '100%',
        }}>
        <ListItem>
          <ListItemIcon>
            <Cable />
          </ListItemIcon>
          <ListItemText>TCP Port</ListItemText>
          <TextField defaultValue={port} size='small'
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            error={error != undefined}
            helperText={error}
            sx={{ width: 80 }}
            onChange={ev => onEvent({ port: parseInt(ev.target.value, 10) })} />
        </ListItem>
      </List>
    )
    */
  }
}

ManagedWindowComponent.attach<SettingsProps, SettingsEvent>(
  "settings",
  document.querySelector("#app")!,
  SettingsPage
)
