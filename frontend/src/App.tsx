import { useState, useEffect } from "react"
import { Toaster } from "sonner"
import { HomePage } from "@/pages/HomePage"
import { CustomFoodsPage } from "@/pages/CustomFoodsPage"

type Page = "tracker" | "foods"
const PAGE_KEY = "nutragocalc_page"

function loadPage(): Page {
  try {
    const saved = localStorage.getItem(PAGE_KEY)
    if (saved === "tracker" || saved === "foods") return saved
  } catch { /* ignore */ }
  return "tracker"
}

export default function App() {
  const [page, setPage] = useState<Page>(loadPage)

  useEffect(() => {
    try { localStorage.setItem(PAGE_KEY, page) } catch { /* ignore */ }
  }, [page])

  return (
    <>
      {page === "tracker" ? (
        <HomePage onNavigateToFoods={() => setPage("foods")} />
      ) : (
        <CustomFoodsPage onBack={() => setPage("tracker")} />
      )}
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "border border-neutral-200 shadow-lg",
        }}
      />
    </>
  )
}
