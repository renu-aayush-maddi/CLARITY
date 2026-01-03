import { Card, Text, Group, ThemeIcon, Button, Textarea, Alert, Skeleton } from '@mantine/core';
import { Sparkles, Send, Mail } from 'lucide-react';

export default function AgentPanel({ metrics, handleDraftEmail, agentLoading, emailDraft, setEmailDraft, loading }) {
  const riskySites = metrics?.top_risky_sites || [];
  const topSite = riskySites.length > 0 ? riskySites[0].site : "N/A";
  const hasRisk = topSite !== "N/A";

  return (
    <Card withBorder shadow="sm" radius="md" padding="lg" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
        <Group mb="md">
            <ThemeIcon color="violet" variant="light" size="lg">
                <Sparkles size={20} />
            </ThemeIcon>
            <div>
                <Text fw={600}>Clarity Copilot</Text>
                <Text size="xs" c="dimmed">AI-Driven Action Items</Text>
            </div>
        </Group>

        <Skeleton visible={loading} h={80} mb="lg">
            <Alert variant="light" color={hasRisk ? "red" : "green"} title={hasRisk ? "Anomaly Detected" : "System Normal"}>
                {hasRisk 
                  ? `Site ${topSite} has exceeded risk thresholds. Recommended: Escalate to Monitor.` 
                  : "All sites performing within parameters."}
            </Alert>
        </Skeleton>

        <div style={{ marginTop: 'auto' }}>
            {!emailDraft ? (
                <Button 
                   fullWidth 
                   color="violet" 
                   onClick={handleDraftEmail} 
                   loading={agentLoading}
                   disabled={loading || !hasRisk}
                >
                    Generate Escalation Email
                </Button>
            ) : (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                        <Group bg="gray.1" px="sm" py="xs" gap={5}>
                            <Mail size={14} />
                            <Text size="xs" fw={700} c="dimmed">PREVIEW</Text>
                        </Group>
                        <Textarea 
                            variant="unstyled" 
                            p="xs" 
                            minRows={6}
                            value={`${emailDraft.generated_email.subject}\n\n${emailDraft.generated_email.body}`}
                            readOnly
                        />
                    </div>
                    <Group grow>
                        <Button variant="default" onClick={() => setEmailDraft(null)}>Discard</Button>
                        <Button color="green" onClick={() => { alert("Sent!"); setEmailDraft(null); }} leftSection={<Send size={16}/>}>
                            Approve & Send
                        </Button>
                    </Group>
                </div>
            )}
        </div>
    </Card>
  );
}