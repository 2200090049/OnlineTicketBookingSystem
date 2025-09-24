import PropTypes from 'prop-types';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button, Card } from '../index';

const DataTable = ({ 
  title, 
  description, 
  data, 
  columns, 
  onAdd, 
  onEdit, 
  onDelete,
  onView,
  onSearch,
  onPageChange,
  onStatusFilter,
  currentPage = 0,
  isLoading = false,
  searchQuery = '',
  statusFilter = '',
  addButtonText = 'Add New',
  emptyIcon: EmptyIcon,
  emptyTitle = 'No items found',
  emptyDescription = 'Get started by creating a new item.' 
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
          <Button onClick={onAdd}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {addButtonText}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring-1 focus:ring-blue-300 sm:text-sm"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {onStatusFilter && (
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="MOVIES_ADMIN">Movies Admin</option>
              <option value="TRAIN_ADMIN">Train Admin</option>
              <option value="BUSES_ADMIN">Buses Admin</option>
              <option value="Defualt">Default</option>
            </select>
          )}
        </div>
      </div>

      <Card>
        <div className="p-6">
          {data.length === 0 ? (
            <div className="text-center py-12">
              {EmptyIcon && <EmptyIcon className="mx-auto h-12 w-12 text-gray-400" />}
              <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyTitle}</h3>
              <p className="mt-1 text-sm text-gray-500">{emptyDescription}</p>
              <div className="mt-6">
                <Button onClick={onAdd}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {addButtonText}
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.header}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr key={item.id}>
                      {columns.map((column) => (
                        <td
                          key={`${item.id}-${column.key}`}
                          className={`px-6 py-4 whitespace-nowrap ${
                            column.key === columns[0].key 
                              ? 'text-sm font-medium text-gray-900' 
                              : 'text-sm text-gray-500'
                          }`}
                        >
                          {column.render ? column.render(item) : item[column.key]}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {onView && (
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => onView(item)}
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button 
                              className="text-yellow-600 hover:text-yellow-900"
                              onClick={() => onEdit(item)}
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => onDelete(item.id)}
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between gap-1 sm:hidden">
                  <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0 || isLoading}
                    variant="outline"
                  >
                    Previous
                  </Button>

                  <div className="w-4" />

                  <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={data.length < 10 || isLoading}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{data.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <Button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0 || isLoading}
                        variant="outline"
                        className="rounded-l-md"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={data.length < 10 || isLoading}
                        variant="outline"
                        className="rounded-r-md"
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

DataTable.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    render: PropTypes.func,
  })).isRequired,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  onSearch: PropTypes.func,
  onPageChange: PropTypes.func,
  onStatusFilter: PropTypes.func,
  currentPage: PropTypes.number,
  isLoading: PropTypes.bool,
  searchQuery: PropTypes.string,
  statusFilter: PropTypes.string,
  addButtonText: PropTypes.string,
  emptyIcon: PropTypes.elementType,
  emptyTitle: PropTypes.string,
  emptyDescription: PropTypes.string,
};

export default DataTable;