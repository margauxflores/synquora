"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

const navigation = [
  { name: "Events", href: "/", match: /^\/$/ },
  { name: "Past Events", href: "/past-events", match: /^\/past-events/ },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="min-h-full">
      <div className="bg-indigo-600 pb-32">
        <Disclosure as="nav" className="border-b border-indigo-300/25 bg-indigo-600">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-indigo-400/25">
                  {/* Logo + Nav */}
                  <div className="flex items-center px-2 lg:px-0">
                    <div className="shrink-0">
                      <img alt="Synquora Logo" src="/synquora-logo.svg" className="block size-8" />
                    </div>
                    <div className="hidden lg:ml-10 lg:block">
                      <div className="flex space-x-4">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.match.test(pathname)
                                ? "bg-indigo-700 text-white"
                                : "text-white hover:bg-indigo-500/75",
                              "rounded-md px-3 py-2 text-sm font-medium"
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile menu toggle */}
                  <div className="flex lg:hidden">
                    <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500/75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                      <span className="sr-only">Open main menu</span>
                      <Bars3Icon
                        className={classNames("block size-6", open ? "hidden" : "block")}
                      />
                      <XMarkIcon
                        className={classNames("block size-6", open ? "block" : "hidden")}
                      />
                    </DisclosureButton>
                  </div>

                  {/* Desktop user menu or auth links */}
                  <div className="hidden lg:ml-4 lg:block">
                    {user ? (
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="relative shrink-0 rounded-full bg-indigo-600 p-1 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                        >
                          <span className="sr-only">View notifications</span>
                          <BellIcon className="size-6" />
                        </button>

                        <Menu as="div" className="relative ml-3 shrink-0">
                          <div>
                            <MenuButton className="relative flex rounded-full bg-indigo-600 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600">
                              <span className="sr-only">Open user menu</span>
                              <img
                                className="size-8 rounded-full"
                                src={user.imageUrl || ""}
                                alt={user.fullName || "User"}
                              />
                            </MenuButton>
                          </div>
                          <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                            <MenuItem>
                              <Link
                                href="/profile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Your Profile
                              </Link>
                            </MenuItem>
                            <MenuItem>
                              <button
                                onClick={() => signOut()}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Sign out
                              </button>
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <Link
                          href="/sign-in"
                          className="text-white hover:bg-indigo-500/75 rounded-md px-3 py-2 text-sm font-medium"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/sign-up"
                          className="text-white hover:bg-indigo-500/75 rounded-md px-3 py-2 text-sm font-medium"
                        >
                          Sign up
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Nav Panel */}
              <DisclosurePanel className="lg:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3">
                  {navigation.map((item) => (
                    <DisclosureButton
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className={classNames(
                        item.match.test(pathname)
                          ? "bg-indigo-700 text-white"
                          : "text-white hover:bg-indigo-500/75",
                        "block rounded-md px-3 py-2 text-base font-medium"
                      )}
                    >
                      {item.name}
                    </DisclosureButton>
                  ))}
                </div>

                {user ? (
                  <div className="border-t border-indigo-700 pt-4 pb-3">
                    <div className="flex items-center px-5">
                      <img
                        className="size-10 rounded-full"
                        src={user.imageUrl || ""}
                        alt={user.fullName || "User"}
                      />
                      <div className="ml-3">
                        <div className="text-base font-medium text-white">{user.fullName}</div>
                        <div className="text-sm font-medium text-indigo-300">
                          {user.emailAddresses?.[0]?.emailAddress}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      <DisclosureButton
                        as={Link}
                        href="/profile"
                        className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500/75"
                      >
                        Your Profile
                      </DisclosureButton>
                      <DisclosureButton
                        as="button"
                        type="button"
                        onClick={() => signOut()}
                        className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500/75"
                      >
                        Sign out
                      </DisclosureButton>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-indigo-700 pt-4 pb-3 px-2 space-y-1">
                    <DisclosureButton
                      as={Link}
                      href="/sign-in"
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500/75"
                    >
                      Sign in
                    </DisclosureButton>
                    <DisclosureButton
                      as={Link}
                      href="/sign-up"
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500/75"
                    >
                      Sign up
                    </DisclosureButton>
                  </div>
                )}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>

        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Event Scheduler</h1>
          </div>
        </header>
      </div>

      <main className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 dark:bg-zinc-900 dark:text-white">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
