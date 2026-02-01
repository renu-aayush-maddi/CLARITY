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
  usePortal = true,      // Allow inline popover when false
  zIndex = 1002,
  totalSteps = 8,
  noHighlight = false, // New prop to disable focus ring
  withArrow = true,    // Prop to control arrow visibility
  noFlip = false,      // Prop to disable auto-flip
  onBack = null        // Optional back callback
}) {
  const theme = useMantineTheme();
  const isActive = tourActive && currentStep === stepIndex;
  const isLast = stepIndex === totalSteps - 1;

  // Modern highlight visual: Consistent layered ring with glow
  const highlightStyle = (isActive && !noHighlight) ? {
    position: 'relative',
    zIndex: zIndex - 1, // Always one level below the popover
    boxShadow: `0 0 0 4px #dbe4ff, 0 0 0 8px #e7f5ff, 0 8px 24px -4px rgba(0, 0, 0, 0.12)`,
    borderRadius: '16px',
    backgroundColor: 'white',
    transition: 'all 0.3s ease',
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
      withArrow={withArrow}
      shadow="xl"
      zIndex={zIndex}
      withinPortal={usePortal}
      offset={16}
      arrowSize={14}
      radius="lg"
      trapFocus={isActive}
      middlewares={{
        flip: !noFlip,
        shift: { padding: 8 },
        inline: false
      }}
      keepMounted={false}
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

      <Popover.Dropdown style={{ padding: 0, border: 'none', background: 'transparent', maxWidth: '100vw' }}>
        <Paper
          radius="md"
          shadow="xl"
          style={{
            overflow: 'hidden',
            border: 'none',
            backgroundColor: 'white',
            borderRadius: '16px',
            width: popoverWidth,
            maxWidth: 'calc(100vw - 32px)'
          }}
        >

          {/* Header: Clean gradient top bar with proper border-radius */}
          <Box
            p="md"
            pb="xs"
            bg="linear-gradient(135deg, #228be6 0%, #15aabf 100%)"
            c="white"
            style={{
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}
          >
            <Group justify="space-between" align="start" wrap="nowrap">
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
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  onFinish();
                }}
                style={{
                  opacity: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  color: theme.colors.blue[6],
                  flexShrink: 0
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
              <Group gap="xs">
                {stepIndex > 0 && onBack && (
                  <Button
                    size="sm"
                    variant="subtle"
                    color="gray"
                    onClick={onBack}
                    fw={600}
                  >
                    ← Back
                  </Button>
                )}
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  onClick={onFinish}
                  fw={600}
                >
                  Skip Tour
                </Button>
              </Group>

              <Button
                size="sm"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                radius="md"
                rightSection={isLast ? <Check size={16} /> : <ArrowRight size={16} />}
                onClick={isLast ? onFinish : onNext}
                fw={700}
                style={{ transform: 'scale(1.02)' }}
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
