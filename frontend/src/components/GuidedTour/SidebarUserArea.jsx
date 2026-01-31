import React from 'react';
import { Group, Avatar, Text, ActionIcon } from '@mantine/core';
import { LogOut } from 'lucide-react';
import TourStep from './TourStep';

export default function SidebarUserArea({
    userRole,
    tourActive,
    tourStep,
    setTourStep,
    setTourActive,
    onLogout,
    TotalSteps
}) {
    return (
        <Group justify="space-between">
            <Group gap="sm">
                <Avatar color={userRole === 'Lead' ? 'blue' : 'orange'} radius="xl">
                    {userRole === 'Lead' ? 'DR' : 'JD'}
                </Avatar>
                <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>{userRole === 'Lead' ? 'Dr. Roe' : 'Jane Doe'}</Text>
                    <Text c="dimmed" size="xs">{userRole === 'Lead' ? 'Global Lead' : 'Site Monitor'}</Text>
                </div>
            </Group>

            {/* Step 10: Logout Button */}
            {tourActive && tourStep === 10 ? (
                <TourStep
                    stepIndex={10}
                    currentStep={tourStep}
                    totalSteps={TotalSteps}
                    tourActive={tourActive}
                    onNext={() => {
                        setTourStep(11); // useEffect in parent will handle setUserRole(null)
                    }}
                    onFinish={() => setTourActive(false)}
                    title="Switch Roles"
                    content="Click the logout button below or click Next to explore the CRA (Site Monitor) perspective."
                    position="top"
                    popoverWidth={320}
                    zIndex={1010}
                    usePortal={true}
                    noHighlight={false}
                >
                    <ActionIcon
                        variant="light"
                        color="gray"
                        onClick={() => setTourStep(11)}
                        title="Switch Role"
                    >
                        <LogOut size={16} />
                    </ActionIcon>
                </TourStep>
            ) : (
                <ActionIcon variant="light" color="gray" onClick={onLogout} title="Switch Role">
                    <LogOut size={16} />
                </ActionIcon>
            )}
        </Group>
    );
}
