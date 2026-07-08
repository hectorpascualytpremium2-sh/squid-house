import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface LandingScreenProps {
  onEnter: () => void;
}

const LANDING_PASSWORD = 'hectorjuan';

const LandingScreen = ({ onEnter }: LandingScreenProps) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const targetDate = new Date('2026-07-10T00:00:00').getTime();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleShowPassword = () => setShowPasswordModal(true);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === LANDING_PASSWORD) {
      setPassword('');
      setError('');
      setShowPasswordModal(false);
      onEnter();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleCloseModal = () => {
    setPassword('');
    setError('');
    setShowPasswordModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'radial-gradient(circle at center, #1f4444, #0a1e1e)' }}>
      <div className="relative w-full max-w-lg px-4">
        <section className="login-card bg-amber-50 p-8 rounded-lg mx-auto shadow-2xl border border-gray-200">
          <div className="login-header text-center mb-6">
            <div className="shapes-logo text-4xl font-extrabold tracking-widest text-gray-900">○△□</div>
            <h1 className="mt-2 text-xl font-extrabold uppercase">El Juego del Calamar</h1>
          </div>

          {/* Countdown - kept from original LandingScreen */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative rounded-lg bg-gray-800/10 p-4">
              <div className="text-3xl font-bold text-purple-700 mb-1">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Days</div>
            </div>
            <div className="relative rounded-lg bg-gray-800/10 p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Hours</div>
            </div>
            <div className="relative rounded-lg bg-gray-800/10 p-4">
              <div className="text-3xl font-bold text-pink-600 mb-1">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Minutes</div>
            </div>
            <div className="relative rounded-lg bg-gray-800/10 p-4">
              <div className="text-3xl font-bold text-cyan-600 mb-1">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Seconds</div>
            </div>
          </div>

          {/* Simple form inputs styled from LoginExample; submitting shows password modal */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleShowPassword();
            }}
          >
            <div className="input-group mb-4 text-left">
              <label htmlFor="player-id" className="block text-xs font-semibold text-gray-600 uppercase mb-2">Número de Jugador</label>
              <input id="player-id" name="player-id" placeholder="Ej. 456" className="w-full p-3 bg-transparent border-b border-gray-300 font-semibold focus:outline-none focus:border-pink-600" />
            </div>

            <div className="input-group mb-4 text-left">
              <label htmlFor="access-code" className="block text-xs font-semibold text-gray-600 uppercase mb-2">Código de Acceso</label>
              <input id="access-code" name="access-code" type="password" placeholder="••••••" className="w-full p-3 bg-transparent border-b border-gray-300 font-semibold focus:outline-none focus:border-pink-600" />
            </div>

            <button type="submit" className="w-full py-3 mt-2 bg-pink-600 text-white font-bold uppercase rounded hover:bg-pink-700 transition-all">Entrar al Juego</button>
          </form>

          <div className="login-footer mt-4 text-sm text-gray-600 text-center">
            <p>¿Aún no tienes tu invitación? <a href="#" className="text-pink-600 font-semibold">Solicitar ingreso</a></p>
            <p className="mt-2"><a href="#" className="text-pink-600 font-semibold">¿Olvidaste tu código?</a></p>
          </div>
        </section>

        {/* Animated background particles (subtle) */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-purple-400/20 animate-pulse"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 13) % 100}%`,
                animationDelay: `${(i % 5) * 0.5}s`,
              }}
            />
          ))}
        </div>

      </div>

      {/* Password Modal (kept from original component) */}
      <Transition show={showPasswordModal} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.5)] p-6 md:p-8 text-left align-middle transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                  >
                    Enter Password
                  </Dialog.Title>
                  <p className="text-gray-400 mb-6">Enter the password to access Squid House</p>

                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-4">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 bg-gray-900 border border-purple-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        autoFocus
                      />
                      {error && (
                        <p className="mt-2 text-sm text-red-400">{error}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all"
                      >
                        Enter
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default LandingScreen;

