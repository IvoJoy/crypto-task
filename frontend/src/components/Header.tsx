import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Real-time data and trading</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/">?</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/register">Create User</Link>
        </div>
        <div className="px-2 font-bold">
          <Link to="/users">Users</Link>
        </div>
      </nav>
    </header>
  )
}
