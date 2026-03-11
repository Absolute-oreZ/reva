import NavigationMenu from "@/components/shared/navigation-menu";
import { UserProvider } from "@/lib/context/user-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <UserProvider>
        <NavigationMenu />
        {children}
      </UserProvider >
    </>
  )
}