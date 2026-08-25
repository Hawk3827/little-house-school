import React from 'react';

export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-150">{children}</div>;
}
