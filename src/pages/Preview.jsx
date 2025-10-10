import React from 'react';
import { DemoWidget } from '../components/DemoWidget';

/**
 * Preview Page - Full-screen menu preview
 * Used when scanning QR code from landing page
 */
export default function Preview() {
  return (
    <div className="min-h-screen bg-white">
      <DemoWidget />
    </div>
  );
}

Preview.loader = async () => {
  return {};
};
