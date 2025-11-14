export default function Loading() {
  return (
    <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FA5D29] border-r-transparent mx-auto mb-4" />
        <p className="text-zinc-400">Loading game details...</p>
      </div>
    </div>
  );
}
