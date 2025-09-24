import PropTypes from 'prop-types';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import DataTable from './DataTable';

const VendorManagement = ({ vendors, onAddVendor, onViewVendor, onEditVendor, onDeleteVendor }) => {
  const columns = [
    {
      key: 'vendor',
      header: 'Vendor',
      render: (vendor) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{vendor.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'vendorType',
      header: 'Type',
      render: (vendor) => vendor.vendorType || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      ),
    },
  ];

  return (
    <DataTable
      title="Vendor Management"
      description="Manage all system vendors"
      data={vendors}
      columns={columns}
      onAdd={onAddVendor}
      onView={onViewVendor}
      onEdit={onEditVendor}
      onDelete={onDeleteVendor}
      addButtonText="Add Vendor"
      emptyIcon={BuildingOfficeIcon}
      emptyTitle="No vendors found"
      emptyDescription="Get started by adding your first vendor."
    />
  );
};

VendorManagement.propTypes = {
  vendors: PropTypes.array.isRequired,
  onAddVendor: PropTypes.func.isRequired,
  onViewVendor: PropTypes.func,
  onEditVendor: PropTypes.func,
  onDeleteVendor: PropTypes.func,
};

export default VendorManagement;