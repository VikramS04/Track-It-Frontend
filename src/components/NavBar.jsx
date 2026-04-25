function NavBar({ sidebarOpen = true, setSidebarOpen = () => {}, onAddExpense = () => {} }) {
  return (
    <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-white transition-colors text-xl"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg font-black">Good morning, Vikram 👋</h1>
              <p className="text-xs text-slate-500">Tuesday, 31 March 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <button onClick={onAddExpense} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/25">
              <span>＋</span> Add Expense
            </button>
          </div>
        </header>
  )
}

export default NavBar
