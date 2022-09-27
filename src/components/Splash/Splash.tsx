import { LoginButton } from '../LoginButton'

const Splash = () => (
  <div className="flex column h-screen p-4" data-theme="coffee">
    <header className="fixed w-full flex justify-end top-4 right-4 p-2">
      <LoginButton />
    </header>

    <div className="intro ml-11 mt-32">
      <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white text-gradient-brand ">
        Poucher.io
      </h1>
      <p className="text-grey-900 mt-4">All your stuff in one place.</p>
    </div>
    <svg
      className="absolute left-0 right-0 bottom-0 fill-base-300 col-start-1 row-start-1 h-auto w-full"
      width="1600"
      height="595"
      viewBox="0 0 1600 595"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 338L53.3 349.2C106.7 360.3 213.3 382.7 320 393.8C426.7 405 533.3 405 640 359.3C746.7 313.7 853.3 222.3 960 189.2C1066.7 156 1173.3 181 1280 159.2C1386.7 137.3 1493.3 68.7 1546.7 34.3L1600 0V595H1546.7C1493.3 595 1386.7 595 1280 595C1173.3 595 1066.7 595 960 595C853.3 595 746.7 595 640 595C533.3 595 426.7 595 320 595C213.3 595 106.7 595 53.3 595H0V338Z"></path>
    </svg>
  </div>
)

export { Splash }
