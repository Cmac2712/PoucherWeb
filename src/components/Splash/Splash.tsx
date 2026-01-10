import { LoginForm } from '../LoginForm'
import { FeatureCards } from './FeatureCards'

const Splash = () => (
  <div className="min-h-screen flex flex-col lg:flex-row bg-white">
    {/* Left: Hero + Features */}
    <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 relative overflow-hidden bg-gradient-to-br from-forest-50 to-white">
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, #16a34a 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-forest-600">
          Poucher.io
        </h1>
        <p className="text-foreground-muted text-lg mt-4 max-w-md">
          All your stuff in one place. Save, organize, and find your bookmarks with ease.
        </p>

        <FeatureCards />
      </div>
    </div>

    {/* Right: Login Form */}
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 lg:border-l lg:border-gray-200">
      <LoginForm />
    </div>
  </div>
)

export { Splash }
