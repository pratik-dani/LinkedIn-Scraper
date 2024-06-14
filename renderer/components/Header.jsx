import { Fragment, useState } from "react";
import { Dialog, Disclosure, Popover, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  SquaresPlusIcon,
  XMarkIcon,
  UserIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { Button } from "@mui/material";
import { DiGithubBadge } from "react-icons/di";

const products = [
  {
    name: "Accounts",
    description: "View connected LinkedIn accounts and connect new accounts",
    href: "/addAccount",
    icon: UserGroupIcon,
  },
  {
    name: "People",
    description: "Extract data from LinkedIn people profiles",
    href: "/peopleProfiles",
    icon: UserIcon,
  },
  {
    name: "Company",
    description: "Extract data from LinkedIn company profiles",
    href: "/companyProfiles",
    icon: BuildingLibraryIcon,
  },
  //   {
  //     name: "Security",
  //     description: "Your customers’ data will be safe and secure",
  //     href: "#",
  //     icon: FingerPrintIcon,
  //   },
  {
    name: "Plugins",
    description: "Additional Plugins (Coming Soon)",
    href: "#",
    icon: SquaresPlusIcon,
  },
];

const callsToAction = [
  // { name: "Watch demo", href: "#", icon: PlayCircleIcon },
  // { name: "Contact sales", href: "#", icon: PhoneIcon },
  // { name: "View all products", href: "#", icon: RectangleGroupIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const GithubButton = () => {
  const githubLink = 'https://github.com/devildani/LinkedIn-Scraper'
  return (
    <>
      <Button
        className="grid grid-flow-col gap-2 py bg-black hover:bg-gray-600 hover:text-white content-center"
        color="inherit"
        onClick={() => {
          console.log("Started");
          return window.ipc.send("open-link", githubLink);
        }}
      >
        <>
          <DiGithubBadge className="h-8 w-8 text-white" />
          <span className="text-white">Follow @LinkedIn-Scraper</span>
        </>
      </Button>
    </>
  );
};
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative isolate z-10 bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 cst:px-8 "
        aria-label="Global"
      >
        <div className="flex cst:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">LinkedIn Scraper</span>
            <img className="h-8 w-auto" src="/images/logo.png" alt="" />
          </Link>
        </div>
        <div className="flex cst:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <Popover.Group className="hidden cst:grid cst:grid-flow-col cst:gap-x-8 lg:gap-x-12 items-center">
          <Popover>
            <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
              Product
              <ChevronDownIcon
                className="h-5 w-5 flex-none text-gray-400"
                aria-hidden="true"
              />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-1"
            >
              <Popover.Panel className="absolute inset-x-0 top-0 -z-10 bg-white pt-14 shadow-lg ring-1 ring-gray-900/5">
                <div className="mx-auto grid max-w-7xl grid-cols-4 gap-x-4 px-6 py-10 cst:px-8 xl:gap-x-8">
                  {products.map((item, index) => (
                    <div
                      key={index}
                      className="group relative rounded-lg p-6 text-sm leading-6 hover:bg-gray-50"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                        <item.icon
                          className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                          aria-hidden="true"
                        />
                      </div>
                      <a
                        href={item.href}
                        className="mt-6 block font-semibold text-gray-900"
                      >
                        {item.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50">
                  <div className="mx-auto max-w-7xl px-6 cst:px-8">
                    <div className="grid grid-cols-3 divide-x divide-gray-900/5 border-x border-gray-900/5">
                      {callsToAction.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100"
                        >
                          <item.icon
                            className="h-5 w-5 flex-none text-gray-400"
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>
          <Link
            href="#"
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={() =>
              window.ipc.send("open-link", "https://tally.so/r/3xQ2zk")
            }
          >
            Feature Request
          </Link>
          <Link
            href="#"
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={() =>
              window.ipc.send("open-link", "https://tally.so/r/3jMLz1")
            }
          >
            Feedback
          </Link>
          <Link
            href="#"
            onClick={() =>
              window.ipc.send(
                "open-link",
                "https://www.buymeacoffee.com/pratikdani"
              )
            }
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Support us
          </Link>
          <GithubButton />
        </Popover.Group>

        <div className="hidden cst:flex cst:flex-1 cst:justify-end">
          {/* <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
            Log in <span aria-hidden="true">&rarr;</span>
          </a> */}
        </div>
      </nav>
      <Dialog
        className="cst:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">LinkedIn Scraper</span>
              <img
                className="h-8 w-auto"
                src="/images/logo.png"
                // src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
              />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {[...products, ...callsToAction].map((item) => (
                  <a
                    key={item.name}
                    // as="a"
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    // className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
                <Link
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() =>
                    window.ipc.send("open-link", "https://tally.so/r/3xQ2zk")
                  }
                >
                  Feature Request
                </Link>
                <Link
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() =>
                    window.ipc.send("open-link", "https://tally.so/r/3jMLz1")
                  }
                >
                  Feedback
                </Link>
                <Link
                  href="#"
                  onClick={() =>
                    window.ipc.send(
                      "open-link",
                      "https://www.buymeacoffee.com/pratikdani"
                    )
                  }
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Support us
                </Link>
                <GithubButton />
                {/* <Disclosure as="div" className="-mx-3">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                        Product
                        <ChevronDownIcon
                          className={classNames(
                            open ? "rotate-180" : "",
                            "h-5 w-5 flex-none"
                          )}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2">
                        {[...products, ...callsToAction].map((item) => (
                          <Disclosure.Button
                            key={item.name}
                            as="a"
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                          >
                            {item.name}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure> */}
                {/* <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Marketplace
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Company
                </a> */}
              </div>
              {/* <a href="https://www.buymeacoffee.com/pratikdani" target="_blank"> */}
              {/* <a
                href="#"
                // target="_blank"
                onClick={() =>
                  window.ipc.send(
                    "open-link",
                    "https://www.buymeacoffee.com/pratikdani"
                  )
                }
              >
                <img
                  src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
                  alt="Buy Me A Coffee"
                  style={{
                    height: "60px !important",
                    width: "217px !important",
                  }}
                />
              </a> */}
              {/* <div className="py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </a>
              </div> */}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
