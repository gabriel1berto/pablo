import AppNav from "@/app/components/app-nav";

export default function LaudosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AppNav />
    </>
  );
}
