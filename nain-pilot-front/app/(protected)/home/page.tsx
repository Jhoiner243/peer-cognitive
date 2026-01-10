"use client"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <p className="text-muted-foreground mb-8">
            Welcome to your cognitive workspace. Start by creating a new flow or accessing existing projects.
          </p>
          
          {/* Aquí puedes integrar tus componentes existentes */}
          {/* Por ejemplo: <FlowComponent /> o <ChatInterface /> */}
        </div>
      </div>
    </div>
  )
}