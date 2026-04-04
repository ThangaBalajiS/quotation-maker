'use client';

import { useState, useEffect } from 'react';
import { Joyride, EventData, STATUS, Step } from 'react-joyride';

export default function DashboardJoyride() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run on the client side with a slight delay
    const timer = setTimeout(() => {
      const hasSeenJoyride = localStorage.getItem('hasSeenJoyride');
      if (!hasSeenJoyride) {
        setRun(true);
      }
    }, 1000); // 1s delay to let components render
    
    return () => clearTimeout(timer);
  }, []);

  const steps: Step[] = [
    {
      target: 'body',
      content: "Welcome to T10i Quotes! Let's take a quick tour to get you started.",
      placement: 'center',
      skipBeacon: true,
    },
    {
      target: '#onboarding-checklist',
      content: "Here's your onboarding checklist. Complete these steps to fully configure your account and start making quotes!",
      placement: 'bottom',
    },
    {
      target: '#stats-overview',
      content: 'This area will display your key metrics like total customers, products, and invoices as your business grows.',
      placement: 'bottom',
    },
    {
      target: '#quick-actions-card',
      content: 'Use these quick actions to rapidly add customers, products, or create new documents.',
      placement: 'left',
    },
    {
      target: '#nav-settings',
      content: 'Click here anytime to update your business profile, signature, or bank details.',
      placement: 'right',
    }
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenJoyride', 'true');
    }
  };

  if (!run) return null;

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        primaryColor: '#2563eb', // blue-600
        zIndex: 10000,
        showProgress: true,
        buttons: ['back', 'close', 'primary', 'skip'],
      }}
    />
  );
}
