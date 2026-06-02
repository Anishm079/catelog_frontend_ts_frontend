import { useEffect, useState } from 'react'
import { useUserState } from '../stores'
import { loginUser } from '../config'
import { useNavigate, useLocation } from 'react-router'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { userDetails, setUserDetails } = useUserState();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { data } = await loginUser(email, password);

    const { success, user } = data as { success: boolean, user: iUser };

    if (success) {
      setUserDetails(user);
      navigate(location.state?.from || '/quotes');
    }
  }

  useEffect(() => {
    if(userDetails){
      navigate(location.state?.from || '/quotes');
    }
  }, [userDetails]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl md:grid-cols-[1.2fr_1fr] lg:p-10">
          <section className="space-y-6 rounded-[1.75rem] bg-slate-950/70 p-8 text-slate-100 shadow-inner shadow-slate-950/30 md:p-10">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-sky-500/10 px-4 py-1 text-sm font-semibold text-sky-300 ring-1 ring-sky-300/20">
                Welcome
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Sign in to continue
              </h1>
              <p className="max-w-xl text-slate-300">
                Access your quotes, manage products, and review features with a single secure login. Your catalog dashboard starts here.
              </p>
            </div>

            <div className="space-y-4 rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Built for productivity</p>
                  <p className="text-sm text-slate-400">Quick access to quotes and product workflows.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-emerald-300">
                  S
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Secure credentials</p>
                  <p className="text-sm text-slate-400">Password-based sign-in with safe session handling.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20 md:p-10">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Login
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white">Enter your account</h2>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-200">
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@example.com"
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="••••••••"
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              >
                Sign in
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Login