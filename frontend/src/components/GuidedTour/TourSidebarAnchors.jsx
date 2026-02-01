import React from 'react';
import TourStep from './TourStep';

export default function TourSidebarAnchors({
    tourStep,
    setTourStep,
    setActiveView,
    tourActive,
    setTourActive,
    TotalSteps
}) {
    if (!tourActive) return null;

    return (
        <>
            {/* Step 4: Global Portfolio */}
            {tourStep === 4 && (
                <TourStep
                    stepIndex={4}
                    currentStep={tourStep}
                    totalSteps={TotalSteps}
                    tourActive={tourActive}
                    onFinish={() => setTourActive(false)}
                    onNext={() => {
                        setTourStep(5);
                        setActiveView('overview');
                    }}
                    title="Global Portfolio"
                    content="View high-level health metrics across all studies in your organization."
                    position="right-end"
                    popoverWidth={360}
                    zIndex={1010}
                    usePortal={true}
                    noHighlight={true}
                    withArrow={false}
                >
                    <div style={{ position: 'absolute', bottom: 100, left: 0, width: '100%', height: 1, pointerEvents: 'none' }} />
                </TourStep>
            )}

            {/* Step 5: Clinical Operations */}
            {tourStep === 5 && (
                <TourStep
                    stepIndex={5}
                    currentStep={tourStep}
                    totalSteps={TotalSteps}
                    tourActive={tourActive}
                    onFinish={() => setTourActive(false)}
                    onNext={() => {
                        setTourStep(6);
                        setActiveView('governance');
                    }}
                    title="Clinical Operations"
                    content="This dashboard shows real-time KPIs and risk metrics for the selected study."
                    position="right-end"
                    popoverWidth={360}
                    zIndex={1010}
                    usePortal={true}
                    noHighlight={true}
                    withArrow={false}
                >
                    <div style={{ position: 'absolute', bottom: 100, left: 0, width: '100%', height: 1, pointerEvents: 'none' }} />
                </TourStep>
            )}

            {/* Step 6: AI Cortex */}
            {tourStep === 6 && (
                <TourStep
                    stepIndex={6}
                    currentStep={tourStep}
                    totalSteps={TotalSteps}
                    tourActive={tourActive}
                    onNext={() => { setTourStep(7); setActiveView('sources'); }}
                    onFinish={() => setTourActive(false)}
                    title="AI Cortex"
                    content="Explore model performance, bias checks, and AI governance tools."
                    position="right-end"
                    popoverWidth={360}
                    zIndex={1010}
                    usePortal={true}
                    noHighlight={true}
                    withArrow={false}
                >
                    {/* Anchor placed in center area */}
                    <div style={{ position: 'absolute', bottom: 100, left: 0, width: '100%', height: 1, pointerEvents: 'none' }} />
                </TourStep>
            )}

            {/* Step 7: Data Sources */}
            {tourStep === 7 && (
                <TourStep
                    stepIndex={7}
                    currentStep={tourStep}
                    totalSteps={TotalSteps}
                    tourActive={tourActive}
                    onNext={() => { setTourStep(8); setActiveView('reports'); }}
                    onFinish={() => setTourActive(false)}
                    title="Data Sources"
                    content="Manage and connect data sources for ingestion and transformations."
                    position="right-end"
                    popoverWidth={360}
                    zIndex={1010}
                    usePortal={true}
                    noHighlight={true}
                    withArrow={false}
                >
                    <div style={{ position: 'absolute', bottom: 100, left: 0, width: '100%', height: 1, pointerEvents: 'none' }} />
                </TourStep>
            )}

            {/* Step 8: Site Reports */}
            {tourStep === 8 && (
                <TourStep
                    stepIndex={8}
                    currentStep={tourStep}
                    totalSteps={TotalSteps}
                    tourActive={tourActive}
                    onNext={() => setTourStep(9)}
                    onFinish={() => setTourActive(false)}
                    title="Site Reports"
                    content="Open detailed site-level reports and findings."
                    position="right-end"
                    popoverWidth={360}
                    zIndex={1010}
                    usePortal={true}
                    noHighlight={true}
                    withArrow={false}
                >
                    <div style={{ position: 'absolute', bottom: 100, left: 0, width: '100%', height: 1, pointerEvents: 'none' }} />
                </TourStep>
            )}
        </>
    );
}
