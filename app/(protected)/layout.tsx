export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth sudah dihandle oleh middleware
  return <>{children}</>;
}
