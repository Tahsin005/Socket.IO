import { Button, Container, TextField, Typography, Box, Stack, Paper } from '@mui/material';
import React from 'react'
import { useMemo } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [roomName, setRoomName] = useState("");
  const [socketID, setSocketID] = useState("");
  const socket = useMemo(() => io("http://localhost:3000", {
    withCredentials: true,
  }), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { message, room })
    setMessage("");
    // setRoom("");
  }

  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName)
    setRoomName("");
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
      setSocketID(socket.id)
    });

    socket.on("received-message", (data) => {
      console.log("received-message: ", data);
      setMessages((message) => [...message, data]);
    })

    socket.on("welcome", (msg) => {
      console.log(msg)
    });

    return () => socket.disconnect()
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='h4' textAlign="center">
        Socket.IO Messenger
      </Typography>

      <Typography textAlign="center" sx={{ color: 'gray' }}>
        Your Socket ID: {socketID}
      </Typography>

      <Box
        component="form"
        onSubmit={joinRoomHandler}
        display="flex"
        gap={2}
        alignItems="center"
        justifyContent="center"
      >
        <TextField
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          label="Room Name"
          variant="outlined"
          size="small"
        />
        <Button type="submit" variant="contained" color="primary">
          Join
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, height: 300, overflowY: 'auto', borderRadius: 2 }}>
        <Stack spacing={1}>
          {messages.map((message, i) => (
            <Box
              key={i}
              sx={{
                backgroundColor: '#1976d2',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 2,
                alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
                maxWidth: '70%'
              }}
            >
              <Typography variant="body1">{message}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          label='Message'
          variant='outlined'
          fullWidth
        />
        <TextField
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          label='Room'
          variant='outlined'
          fullWidth
        />
        <Button type='submit' variant='contained' color='primary'>
          Send
        </Button>
      </Box>
    </Container>
  )
}

export default App;
