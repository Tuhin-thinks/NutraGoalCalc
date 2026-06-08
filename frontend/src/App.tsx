import { Toaster } from "sonner"
import { HomePage } from "@/pages/HomePage"

export default function App() {
  return (
    <>
      <HomePage />
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "border border-neutral-200 shadow-lg",
        }}
      />
    </>
  )
}
