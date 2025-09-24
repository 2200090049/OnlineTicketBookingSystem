import PropTypes from 'prop-types';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, Card } from '../index';

const DataTable = ({ 
  title, 
  description, 
  data, 
  columns, 
  onAdd, 
  onView, 
  onEdit, 
  onDelete, 
  addButtonText,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription 
}) => {
  return (
    <div className="p-6 space-y-6">
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
                              title="View"
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
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

DataTable.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    render: PropTypes.func,
  })).isRequired,
  onAdd: PropTypes.func.isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  addButtonText: PropTypes.string.isRequired,
  emptyIcon: PropTypes.elementType,
  emptyTitle: PropTypes.string.isRequired,
  emptyDescription: PropTypes.string.isRequired,
};

export default DataTable;