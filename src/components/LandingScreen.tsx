import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface LandingScreenProps {
  onEnter: () => void;
}

const LANDING_PASSWORD = 'hectorjuan';

const LandingScreen = ({ onEnter }: LandingScreenProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  const handleEnterClick = () => {
    setShowPasswordModal(true);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <div className="relative w-full max-w-4xl px-4 text-center">
        {/* Title */}
        <h1 className="mb-8 text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent animate-pulse">
          SQUID HOUSE
        </h1>

        {/* Countdown */}
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div className="relative overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 p-6 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <div className="text-4xl md:text-6xl font-bold text-purple-400 mb-2">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
              Days
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 p-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <div className="text-4xl md:text-6xl font-bold text-blue-400 mb-2">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
              Hours
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm border border-pink-500/30 p-6 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <div className="text-4xl md:text-6xl font-bold text-pink-400 mb-2">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
              Minutes
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <div className="text-4xl md:text-6xl font-bold text-cyan-400 mb-2">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
              Seconds
            </div>
          </div>
        </div>

        {/* Target Date */}
        <div className="mb-8 text-lg md:text-xl text-gray-400">
          Until July 10th, 2026
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnterClick}
          className="px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Enter Page
        </button>
      </div>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-purple-400/30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Password Modal */}
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

