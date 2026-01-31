import React from 'react';
import { Group, Menu, ActionIcon, Indicator, ScrollArea, Text, Button, Select, FileButton } from '@mantine/core';
import { Bell, AlertTriangle, XCircle, Sparkles, Search, Upload } from 'lucide-react';
import TourStep from './TourStep';

export default function HeaderControlGroup({
    tourActive,
    tourStep,
    setTourStep,
    setTourActive,
    TotalSteps,
    alerts,
    setEmailDraft,
    openChat,
    availableStudies,
    study,
    setStudy,
    onFileSelect,
    isUploading
}) {
    return (
        <Group>
            {/* Step 1: Activity Alerts */}
            <TourStep
                stepIndex={1}
                currentStep={tourStep}
                totalSteps={TotalSteps}
                tourActive={tourActive}
                onNext={() => setTourStep(2)}
                onFinish={() => setTourActive(false)}
                title="Activity Alerts"
                content="Check here for high-priority risk notifications and agent escalations."
                position="bottom-end"
                zIndex={1010}
            >
                {/* Wrapper for Menu Target */}
                <Menu shadow="md" width={320} position="bottom-end">
                    <Menu.Target>
                        <ActionIcon variant="transparent" size="lg" color="gray">
                            <Indicator color="red" size={10} disabled={alerts.length === 0} processing>
                                <Bell size={20} />
                            </Indicator>
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Agent Alerts ({alerts.length})</Menu.Label>
                        <ScrollArea h={300}>
                            {alerts.length === 0 ? (
                                <Menu.Item><Text size="sm" c="dimmed">All sites look clean.</Text></Menu.Item>
                            ) : (
                                alerts.map((alert, i) => (
                                    <Menu.Item key={i} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                        <Group align="flex-start" wrap="nowrap">
                                            {alert.severity === 'high' ? <XCircle size={16} color="red" /> : <AlertTriangle size={16} color="orange" />}
                                            <div style={{ flex: 1 }}>
                                                <Text size="sm" fw={500}>{alert.title}</Text>
                                                <Text size="xs" c="dimmed" style={{ whiteSpace: 'normal', marginBottom: '8px' }}>
                                                    {alert.message}
                                                </Text>

                                                {/* AGENTIC ACTION BUTTON */}
                                                {alert.action_payload && (
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        color="violet"
                                                        fullWidth
                                                        leftSection={<Sparkles size={12} />}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setEmailDraft(alert.action_payload.body_preview);
                                                        }}
                                                    >
                                                        Review Agent Draft
                                                    </Button>
                                                )}
                                            </div>
                                        </Group>
                                    </Menu.Item>
                                ))
                            )}
                        </ScrollArea>
                    </Menu.Dropdown>
                </Menu>
            </TourStep>

            {/* Step 2: AI Assistant */}
            <TourStep
                stepIndex={2}
                currentStep={tourStep}
                totalSteps={TotalSteps}
                tourActive={tourActive}
                onNext={() => setTourStep(3)}
                onFinish={() => setTourActive(false)}
                title="AI Assistant"
                content="Chat with your data. Ask questions like 'Summarize site 2 Risks'."
                position="bottom"
                zIndex={1010}
            >
                <Button
                    variant="light"
                    color="violet"
                    onClick={openChat}
                    leftSection={<Sparkles size={16} />}
                >
                    Ask AI
                </Button>
            </TourStep>


            <Select
                placeholder="Select Study" data={availableStudies} value={study} onChange={setStudy}
                searchable w={200} variant="filled" leftSection={<Search size={14} />}
            />

            {/* Step 3: Ingest Data */}
            <TourStep
                stepIndex={3}
                currentStep={tourStep}
                totalSteps={TotalSteps}
                tourActive={tourActive}
                onNext={() => setTourStep(4)}
                onFinish={() => setTourActive(false)}
                title="Bring Your Own Data"
                content="Upload new clinical trial datasets (.csv, .xlsx) here."
                position="bottom-end"
                zIndex={1010}
            >
                <FileButton onChange={onFileSelect} multiple accept=".csv,.xlsx">
                    {(props) => (
                        <Button
                            {...props}
                            loading={isUploading}
                            leftSection={<Upload size={16} />}
                        >
                            Ingest Data
                        </Button>
                    )}
                </FileButton>
            </TourStep>
        </Group>
    );
}
