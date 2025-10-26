import { Link, useLocation } from "react-router-dom"

const Breadcrumbs = () => {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)

  return (
    <nav className="w-full text-sm text-gray-600">
      <ol className="flex items-center gap-1">
        <li className="flex items-center gap-1">
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Home
          </Link>
        </li>

        {pathnames.map((name, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/")
          const isLast = index === pathnames.length - 1

          return (
            <li key={routeTo} className="flex items-center gap-1">
              <span>/</span>
              {isLast ? (
                <span className="font-medium text-gray-800">{name}</span>
              ) : (
                <Link to={routeTo} className="text-blue-600 hover:text-blue-700">
                  {name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
