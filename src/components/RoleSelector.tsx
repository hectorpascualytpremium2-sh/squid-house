import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface RoleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOwner: () => void;
  onSelectTeam: () => void;
}

export default function RoleSelector({
  isOpen,
  onClose,
  onSelectOwner,
  onSelectTeam,
}: RoleSelectorProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500/50 shadow-glow-purple p-6 md:p-8 text-center align-middle transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                >
                  🎮 Join Live Quiz
                </Dialog.Title>
                <p className="text-gray-400 mb-6">
                  Choose your role to join the live quiz session
                </p>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      onSelectOwner();
                      onClose();
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-glow-purple hover:shadow-glow-blue transition-all transform hover:scale-105"
                  >
                    📋 Enter as Presenter
                  </button>
                  <button
                    onClick={() => {
                      onSelectTeam();
                      onClose();
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-glow-blue transition-all transform hover:scale-105"
                  >
                    👥 Enter as Team
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
                  >
                    Cancel
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

