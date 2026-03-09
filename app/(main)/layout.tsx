import NavigationMenu from "@/components/shared/navigation-menu";
import { Toaster } from "@/components/ui/sonner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavigationMenu />
      {children}
    </>
  )
}