import { useState } from 'react';
import { 
  Container, Title, Text, Select, Button, Group, 
  Paper, FileButton, List, ThemeIcon, Notification
} from '@mantine/core';
import { IconUpload, IconFileSpreadsheet, IconCheck, IconX } from '@tabler/icons-react';
import api from  "../api/client"

export default function UploadData() {
  // State for the selected study and files
  const [study, setStudy] = useState(null);
  const [files, setFiles] = useState([]);
  
  // State for upload progress/status
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!study || files.length === 0) {
      setError("Please select a Study and at least one file.");
      return;
    }

    setUploading(true);
    setLogs([]);
    setError(null);

    // 1. Create FormData object
    const formData = new FormData();
    formData.append('study_name', study); // <--- This matches backend 'study_name'
    
    // Append all selected files
    files.forEach((file) => {
      formData.append('files', file); 
    });

    try {
      // 2. Send to Backend
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 3. Process Logs
      const results = response.data.summary;
      const newLogs = results.map((res) => {
        if (res.status === 'processed') {
            // Check the details array for success messages
            if (res.details && res.details.length > 0) {
                 return res.details.join(", "); 
            }
            return `✅ ${res.file} processed successfully for ${res.study}`;
        } else {
            return `❌ ${res.file} failed: ${res.reason || res.details}`;
        }
      });
      
      setLogs(newLogs);
      setFiles([]); // Clear files on success

    } catch (err) {
      console.error(err);
      setError("Network Error: Could not connect to backend.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="sm">Data Ingestion Pipeline</Title>
      <Text c="dimmed" mb="xl">
        Select the target Clinical Study and upload operational datasets (CSV/Excel).
      </Text>

      <Paper withBorder shadow="sm" p="xl" radius="md">
        
        {/* 1. Study Selector */}
        <Select
          label="Target Study"
          placeholder="Select Study Context"
          data={['Study 1', 'Study 2', 'Study 3', 'Oncology_Phase3']}
          value={study}
          onChange={setStudy}
          mb="md"
          required
        />

        {/* 2. File Picker */}
        <Group align="flex-end" mb="lg">
          <FileButton onChange={setFiles} accept=".csv,.xlsx,.xls" multiple>
            {(props) => (
              <Button {...props} leftSection={<IconFileSpreadsheet size={18} />} variant="default">
                Select Files ({files.length})
              </Button>
            )}
          </FileButton>
          
          <Button 
            onClick={handleUpload} 
            loading={uploading} 
            leftSection={<IconUpload size={18} />}
            color="blue"
            disabled={!study || files.length === 0}
          >
            Start Ingestion
          </Button>
        </Group>

        {/* 3. Selected Files Preview */}
        {files.length > 0 && (
          <List size="sm" mb="md" spacing="xs" center>
            {files.map((file, index) => (
              <List.Item key={index} icon={<ThemeIcon color="gray" size={16} radius="xl"><IconFileSpreadsheet size={10} /></ThemeIcon>}>
                {file.name}
              </List.Item>
            ))}
          </List>
        )}

        {/* 4. Error Notification */}
        {error && (
            <Notification icon={<IconX size={18} />} color="red" title="Upload Failed" onClose={() => setError(null)} mt="md">
                {error}
            </Notification>
        )}

        {/* 5. Success Logs */}
        {logs.length > 0 && (
          <Container p="xs" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Title order={5} mb="xs">Ingestion Logs</Title>
            <List spacing="xs" size="sm" center>
              {logs.map((log, i) => (
                <List.Item 
                  key={i} 
                  icon={
                    log.includes('❌') 
                      ? <ThemeIcon color="red" size={20} radius="xl"><IconX size={12} /></ThemeIcon>
                      : <ThemeIcon color="teal" size={20} radius="xl"><IconCheck size={12} /></ThemeIcon>
                  }
                >
                  {log}
                </List.Item>
              ))}
            </List>
          </Container>
        )}

      </Paper>
    </Container>
  );
}