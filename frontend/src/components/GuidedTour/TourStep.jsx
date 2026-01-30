import React from 'react';
import { Popover, Text, Title, Button, Group, Box, Paper, Badge, ActionIcon, useMantineTheme } from '@mantine/core';
import { ArrowRight, Check, X } from 'lucide-react';

export default function TourStep({ 
  stepIndex, 
  currentStep, 
  tourActive, 
  onNext, 
  onFinish,
  position = "bottom",
  title, 
  content, 
  children,
  width = "fit-content", // Wrapper width
  popoverWidth = 340,    // Actual popup width (renamed from implicit width)
  zIndex = 1002,
  totalSteps = 4
}) {
  const theme = useMantineTheme();
  const isActive = tourActive && currentStep === stepIndex;
  const isLast = stepIndex === totalSteps - 1;

  // Modern highlight visual: Layered ring with a bit of "glow"
  const highlightStyle = isActive ? {
    position: 'relative',
    zIndex: 1001,
     // A double ring: Inner branding color, Outer subtle fade
    boxShadow: `0 0 0 4px ${theme.colors.blue[1]}, 0 0 0 8px ${theme.colors.blue[0]}, 0 10px 15px -3px rgba(0, 0, 0, 0.1)`,
    borderRadius: '12px',
    backgroundColor: 'white', 
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    pointerEvents: 'auto'
  } : {
    transition: 'all 0.3s ease'
  };

  // Determine wrapper display style
  const wrapperDisplay = width === '100%' ? 'block' : 'inline-block';
  const wrapperWidth = width === '100%' ? '100%' : 'fit-content';

  return (
    <Popover 
      opened={isActive} 
      position={position} 
      withArrow={true}
      shadow="xl" 
      width={popoverWidth} 
      zIndex={zIndex}
      withinPortal
      offset={24} // More clearance
      arrowSize={16}
      radius="lg"
      trapFocus={isActive}
    >
      <Popover.Target>
        {/* Target Wrapper - ensures the highlight wraps the child correctly */}
        <div style={{ 
            ... (isActive ? highlightStyle : {}), 
            display: wrapperDisplay, 
            width: wrapperWidth,
            transition: 'all 0.3s ease'
        }}>
            {children}
        </div>
      </Popover.Target>

      <Popover.Dropdown style={{ padding: 0, border: 'none', background: 'transparent' }}>
        <Paper 
            radius="lg" 
            shadow="xl" 
            bg="white" 
            style={{ 
                overflow: 'hidden', 
                border: `1px solid ${theme.colors.gray[3]}`,
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)' // Increased shadow for visibility
            }}
        >
            
            {/* Header: Clean gradient top bar */}
            <Box 
                p="md" 
                pb="xs"
                bg="linear-gradient(135deg, #228be6 0%, #15aabf 100%)"
                c="white"
            >
                 <Group justify="space-between" align="start">
                    <Box style={{ flex: 1 }}>
                        <Group gap={6} align="center" mb={6}>
                             <Badge 
                                color="white" 
                                variant="outline" 
                                size="sm" 
                                c="white" 
                                tt="uppercase" 
                                radius="sm"
                                fw={800}
                                style={{ borderColor: 'rgba(255,255,255,0.4)', borderWidth: 1 }}
                             >
                                Step {stepIndex + 1}/{totalSteps}
                             </Badge>
                        </Group>
                        <Title order={4} fw={800} lh={1.2} mb={4} style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.2)' }}>
                            {title}
                        </Title>
                    </Box>
                    <ActionIcon 
                        variant="white" 
                        color="blue" 
                        radius="xl"
                        size="md" // Increased size
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent propagation issues
                            onFinish();
                        }}
                        style={{ 
                            opacity: 1, // Full opacity
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            color: theme.colors.blue[6]
                        }}
                    >
                        <X size={18} strokeWidth={3} />
                    </ActionIcon>
                 </Group>
            </Box>

            {/* Content Body */}
            <Box p="lg" pt="md">
                <Text size="sm" c="dark.6" lh={1.6} mb="xl" fw={500}>
                    {content}
                </Text>

                <Group justify="space-between" align="center">
                     <Button 
                        variant="subtle" 
                        color="gray" 
                        size="xs" 
                        compact
                        onClick={onFinish}
                        fw={600}
                    >
                        Skip Tour
                    </Button>

                    <Button 
                        size="sm" 
                        variant="gradient" 
                        gradient={{ from: 'blue', to: 'cyan' }}
                        radius="md"
                        rightSection={isLast ? <Check size={16} /> : <ArrowRight size={16} />}
                        onClick={isLast ? onFinish : onNext}
                        fw={700}
                        style={{ transform: 'scale(1.02)' }} // Slight bump
                    >
                        {isLast ? "Done" : "Next"}
                    </Button>
                </Group>
            </Box>
        </Paper>
      </Popover.Dropdown>
    </Popover>
  );
}
