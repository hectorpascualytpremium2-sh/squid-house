import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Player } from '../types';

interface PlayerModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerModal({
  player,
  isOpen,
  onClose,
}: PlayerModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
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

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 md:items-center md:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4 md:translate-y-0"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4 md:translate-y-0"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500/50 shadow-glow-purple p-6 md:p-8 text-left align-middle transition-all">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1"
                  aria-label="Close"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div
                    className={`relative mb-6 w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 ${
                      player.eliminated
                        ? 'grayscale opacity-50 border-gray-600'
                        : 'border-purple-400 shadow-glow-purple'
                    }`}
                  >
                    <img
                      src={player.picture}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                    {player.eliminated && (
                      <>
                        <div className="absolute inset-0 bg-red-500/30"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm font-bold px-4 py-2 rounded shadow-glow-pink transform -rotate-12">
                            ELIMINATED
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Name */}
                  <Dialog.Title
                    as="h3"
                    className={`text-2xl md:text-3xl font-bold mb-2 ${
                      player.eliminated ? 'text-gray-400' : 'text-white'
                    }`}
                  >
                    {player.name}
                  </Dialog.Title>

                  {/* ID */}
                  <p className="text-gray-400 mb-4">ID: {player.id}</p>

                  {/* Status */}
                  <div
                    className={`px-6 py-3 rounded-lg font-semibold mb-6 ${
                      player.eliminated
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-glow-pink'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    }`}
                  >
                    {player.eliminated ? 'ELIMINATED' : 'ALIVE'}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-glow-purple hover:shadow-glow-blue transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}


