import { LoginButton } from '../LoginButton';

const Splash = () => (
      <div className="flex column h-screen p-4">
        <header className="fixed w-full flex justify-end top-4 right-4 p-2">
          <LoginButton />
        </header>

        <div className="intro ml-11 mt-32">
            <h1 className="text-9xl font-black text-white text-gradient-brand ">
                Poucher.io
            </h1>
            <p className="text-grey-900 mt-4">All your stuff in one place.</p>
        </div>

      </div>
)

export { Splash }