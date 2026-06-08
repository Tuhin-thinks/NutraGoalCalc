import { useState, useEffect } from "react"
import { Toaster } from "sonner"
import { HomePage } from "@/pages/HomePage"
import { CustomFoodsPage } from "@/pages/CustomFoodsPage"
import { DiaryPage } from "@/pages/DiaryPage"

type Page = "tracker" | "foods" | "diary"
const PAGE_KEY = "nutragocalc_page"

function loadPage(): Page {
  try {
    const saved = localStorage.getItem(PAGE_KEY)
    if (saved === "tracker" || saved === "foods" || saved === "diary") return saved
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
      {page === "tracker" && (
        <HomePage
          onNavigateToFoods={() => setPage("foods")}
          onNavigateToDiary={() => setPage("diary")}
        />
      )}
      {page === "foods" && (
        <CustomFoodsPage onBack={() => setPage("tracker")} />
      )}
      {page === "diary" && (
        <DiaryPage onBack={() => setPage("tracker")} />
      )}
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "border border-neutral-200 dark:border-neutral-700 shadow-lg dark:shadow-black/20",
        }}
      />
    </>
  )
}
