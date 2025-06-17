import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">DocSave</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login" className="btn-secondary text-sm sm:text-base px-3 sm:px-4 py-2">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm sm:text-base px-3 sm:px-4 py-2">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Organize Your Documents with Ease
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Store, manage, and access your files, text, and links all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link href="/register" className="btn-primary w-full sm:w-auto text-center">
              Get Started
            </Link>
            <Link href="/about" className="btn-secondary w-full sm:w-auto text-center">
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">File Management</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Upload and organize any type of file with ease. Preview documents directly in your browser.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Text Storage</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Save and edit text documents with rich formatting support. Perfect for notes and drafts.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Link Management</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Store and organize your important links with previews and descriptions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
