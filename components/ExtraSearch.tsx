import ExtraForms from './ExtraForms'

export default function ExtraSearch() {
  return (
    <details className="group w-full max-w-3xl mx-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm open:shadow-lg open:bg-card transition-all duration-300">
      <summary className="cursor-pointer list-none px-6 py-4 text-center text-sm font-semibold text-foreground hover:bg-muted/50 rounded-xl transition-colors select-none flex items-center justify-center gap-2 relative">
         <span className="flex items-center gap-2">
            <span>⚙️ 詳細検索</span>
         </span>
         <span className="group-open:rotate-180 transition-transform duration-300 text-muted-foreground">▼</span>
      </summary>
      
      <div className="px-6 pb-8 pt-2 space-y-6 border-t border-border animate-in fade-in slide-in-from-top-1 duration-200 cursor-default">
        <div className="bg-primary/5 rounded-lg p-3 text-xs text-muted-foreground text-center border border-primary/10">
          <p>複数の条件を組み合わせて検索できます（AND検索）</p>
        </div>
        
        <div className="w-full">
          <ExtraForms />
        </div>
      </div>
    </details>
  )
}
