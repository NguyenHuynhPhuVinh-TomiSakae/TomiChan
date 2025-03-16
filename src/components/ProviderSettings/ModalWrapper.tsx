import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { IconX } from "@tabler/icons-react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  showFooter?: boolean;
  onReset?: () => void;
  onSave?: () => void;
  saveButtonText?: string;
}

export default function ModalWrapper({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
  showFooter = true,
  onReset,
  onSave,
  saveButtonText = "Xong",
}: ModalWrapperProps) {
  const maxWidthClasses =
    {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl",
      full: "max-w-full",
    }[maxWidth] || "max-w-md";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${maxWidthClasses} transform bg-white dark:bg-black text-black dark:text-white dark:border dark:border-white rounded-lg p-6 text-left align-middle shadow-xl transition-all flex flex-col max-h-[calc(100vh-40px)]`}
              >
                <div className="flex justify-between items-center shrink-0">
                  <Dialog.Title as="h3" className="text-xl font-semibold">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer"
                  >
                    <IconX size={20} />
                  </button>
                </div>

                <div className="overflow-y-auto grow my-4 pr-2 scrollbar-hide">
                  {children}
                </div>

                {showFooter && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
                    {onReset && (
                      <button
                        type="button"
                        onClick={onReset}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Đặt lại mặc định
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onSave || onClose}
                      className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {saveButtonText}
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
