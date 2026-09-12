import React from 'react';
import TypographySpecimen from '../components/TypographySpecimen';

export interface DesignSystemPageProps {
  onBack: () => void;
  colorMode: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function DesignSystemPage({
  onBack,
  colorMode,
  onToggleTheme,
}: DesignSystemPageProps) {
  return (
    <TypographySpecimen
      onBack={onBack}
      colorMode={colorMode}
      onToggleTheme={onToggleTheme}
    />
  );
}
