import { useState, useRef, useEffect } from 'react';
import { Drawer, TextInput, ActionIcon, ScrollArea, Box, Text, Paper, Avatar, Group, Code, Loader } from '@mantine/core';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';
import api from  "../api/client"

export default function ClarityChat({ opened, onClose, study }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hello! I can query the database for you. Try "How many subjects are active?"` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const viewport = useRef(null);

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/chat/query', {
        message: userMsg.content,
        study: study
      });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response, sql: res.data.sql }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer 
      opened={opened} onClose={onClose} position="right" size="md"
      title={<Group><Sparkles size={20} color="#7950f2"/><Text fw={700}>Clarity Assistant</Text></Group>}
    >
      <Box h="calc(100vh - 100px)" display="flex" style={{ flexDirection: 'column' }}>
        <ScrollArea viewportRef={viewport} style={{ flex: 1 }}>
          {messages.map((msg, i) => (
            <Box key={i} mb="md" style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
               <Paper p="sm" radius="md" bg={msg.role === 'user' ? 'blue.1' : 'gray.0'}>
                  <Text size="sm">{msg.content}</Text>
                  {msg.sql && <Code block mt="xs" fz="xs">{msg.sql}</Code>}
               </Paper>
            </Box>
          ))}
          {loading && <Loader size="sm" variant="dots" />}
        </ScrollArea>
        <Group mt="md">
            <TextInput 
                style={{ flex: 1 }} placeholder="Ask a question..." 
                value={input} onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            />
            <ActionIcon size="lg" color="violet" onClick={handleSend}><Send size={18}/></ActionIcon>
        </Group>
      </Box>
    </Drawer>
  );
}