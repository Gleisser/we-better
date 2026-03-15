interface AuthTransitionScreenProps {
  message?: string;
}

const AuthTransitionScreen = ({
  message = 'Preparing your workspace...',
}: AuthTransitionScreenProps): JSX.Element => (
  <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.18),_transparent_32%),linear-gradient(180deg,_#111827,_#030712)] px-6 text-white">
    <div className="flex max-w-sm flex-col items-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/55">We Better</p>
        <h1 className="text-xl font-semibold text-white">Syncing your session</h1>
        <p className="text-sm text-white/70">{message}</p>
      </div>
    </div>
  </div>
);

export default AuthTransitionScreen;
