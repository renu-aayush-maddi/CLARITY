import { Modal, Group, Text, Title, Stack, ThemeIcon, Box, UnstyledButton } from '@mantine/core';
import { Sparkles, Compass, Rocket, X } from 'lucide-react';

export default function TourWelcomeModal({ opened, onClose, onStartTour, onManual }) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={null}
            withCloseButton={false}
            centered
            size="lg"
            padding={0} // Also reset padding to 0 to let Hero section fill top
            radius={24}
            overlayProps={{ opacity: 0.6, blur: 8 }}
            closeOnClickOutside={false}
            closeOnEscape={false}
            styles={{
                content: {
                    marginTop: '100px', // Prevent overlap with logo
                    overflow: 'hidden'  // Ensure radius clips content
                }
            }}
        >
            {/* Hero Section */}
            <Box pos="relative" bg="linear-gradient(135deg, #4c6ef5 0%, #15aabf 100%)" p={30} c="white">
                <Box pos="absolute" top={15} right={15} style={{ zIndex: 10 }}>
                    <UnstyledButton onClick={onManual} c="white" style={{ opacity: 0.8, cursor: 'pointer' }}>
                        <X size={18} />
                    </UnstyledButton>
                </Box>
                <Stack gap="xs" align="flex-start">
                    <ThemeIcon size={48} radius="xl" variant="white" c="blue.6">
                        <Rocket size={24} strokeWidth={1.5} />
                    </ThemeIcon>
                    <Title order={2} fw={800} mt="sm" fz={24}>Welcome to CLARITY.AI</Title>
                    <Text size="sm" opacity={0.9} style={{ maxWidth: '90%' }}>
                        Your intelligent copilot for Clinical Operations and Risk Analytics.
                    </Text>
                </Stack>

                {/* Decorative Circles - Adjusted size */}
                <Box
                    pos="absolute"
                    top={-10}
                    right={-10}
                    w={100}
                    h={100}
                    style={{ borderRadius: '50%', background: 'white', opacity: 0.1 }}
                />
                <Box
                    pos="absolute"
                    bottom={-20}
                    right={20}
                    w={60}
                    h={60}
                    style={{ borderRadius: '50%', background: 'white', opacity: 0.1 }}
                />
            </Box>

            {/* Action Section */}
            <Box p={24}>
                <Title order={5} mb="sm" c="dark.7">Get up to speed quickly</Title>
                <Group align="stretch" grow preventGrowOverflow={false}>
                    <UnstyledButton
                        onClick={onStartTour}
                        p="md"
                        style={{
                            border: '1px solid #e9ecef',
                            borderRadius: '16px',
                            transition: 'all 0.2s',
                            backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#4c6ef5';
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e9ecef';
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <Group align="start" wrap="nowrap">
                            <ThemeIcon variant="light" color="blue" size="md" radius="md">
                                <Sparkles size={18} />
                            </ThemeIcon>
                            <div>
                                <Text fw={600} mb={2} size="sm" c="dark.9">Start Guided Tour</Text>
                                <Text size="xs" c="dimmed" lh={1.3}>
                                    30-second interactive guide.
                                </Text>
                            </div>
                        </Group>
                    </UnstyledButton>

                    <UnstyledButton
                        onClick={onManual}
                        p="md"
                        style={{
                            border: '1px solid #e9ecef',
                            borderRadius: '16px',
                            transition: 'all 0.2s',
                            backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#fab005';
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e9ecef';
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <Group align="start" wrap="nowrap">
                            <ThemeIcon variant="light" color="gray" size="md" radius="md">
                                <Compass size={18} />
                            </ThemeIcon>
                            <div>
                                <Text fw={600} mb={2} size="sm" c="dark.9">Explore Manually</Text>
                                <Text size="xs" c="dimmed" lh={1.3}>
                                    Skip intro and dive in.
                                </Text>
                            </div>
                        </Group>
                    </UnstyledButton>
                </Group>
            </Box>
        </Modal>
    );
}
