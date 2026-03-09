import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="flex size-6 items-center justify-center">
                <Image
                  src="/icons/logo.png"
                  alt="logo"
                  width={0}
                  height={0}
                  sizes="28px"
                  className="w-7 h-7"
                />
              </div>
              REVA
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            {children}
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <img
            src="/images/dejavu-placeholder.jpg"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </>
  )
}