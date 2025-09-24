import PropTypes from 'prop-types';
import { TruckIcon, FilmIcon } from '@heroicons/react/24/outline';
import DataTable from './DataTable';

const TransportManagement = ({ 
  type = 'trains', // provide a default value
  data, 
  onAddItem, 
  onViewItem, 
  onEditItem, 
  onDeleteItem 
}) => {
  const typeConfig = {
    trains: { 
      title: 'Train Management', 
      icon: TruckIcon, 
      singular: 'train',
      itemName: 'Train'
    },
    movies: { 
      title: 'Movie Management', 
      icon: FilmIcon, 
      singular: 'movie',
      itemName: 'Movie'
    },
    buses: { 
      title: 'Bus Management', 
      icon: TruckIcon, 
      singular: 'bus',
      itemName: 'Bus'
    }
  };

  const config = typeConfig[type];
  
  if (!config) {
    console.error(`Invalid type "${type}" provided to TransportManagement component`);
    return null; // Return null if type is invalid
  }

  const Icon = config.icon;

  const getColumns = () => {
    const baseColumns = [
      {
        key: 'name',
        header: 'Name',
      }
    ];

    if (type === 'trains') {
      return [
        ...baseColumns,
        {
          key: 'trainNumber',
          header: 'Train Number',
        },
        {
          key: 'route',
          header: 'Route',
          render: (item) => `${item.sourceStation} → ${item.destinationStation}`,
        },
        {
          key: 'trainClass',
          header: 'Class',
        },
        {
          key: 'price',
          header: 'Price',
          render: (item) => `₹${item.price}`,
        },
      ];
    } else if (type === 'movies') {
      return [
        ...baseColumns,
        {
          key: 'genre',
          header: 'Genre',
        },
        {
          key: 'duration',
          header: 'Duration',
          render: (item) => `${item.duration} min`,
        },
        {
          key: 'rating',
          header: 'Rating',
        },
        {
          key: 'price',
          header: 'Price',
          render: (item) => `₹${item.price}`,
        },
      ];
    } else if (type === 'buses') {
      return [
        ...baseColumns,
        {
          key: 'busNumber',
          header: 'Bus Number',
        },
        {
          key: 'route',
          header: 'Route',
          render: (item) => `${item.source} → ${item.destination}`,
        },
        {
          key: 'busType',
          header: 'Type',
        },
        {
          key: 'price',
          header: 'Price',
          render: (item) => `₹${item.price}`,
        },
      ];
    }

    return baseColumns;
  };

  return (
    <DataTable
      title={config.title}
      description={`Manage all ${type} in the system`}
      data={data}
      columns={getColumns()}
      onAdd={() => onAddItem(config.singular)}
      onView={onViewItem}
      onEdit={onEditItem}
      onDelete={(id) => onDeleteItem(id, config.singular)}
      addButtonText={`Add ${config.itemName}`}
      emptyIcon={Icon}
      emptyTitle={`No ${type} found`}
      emptyDescription={`Get started by adding your first ${config.singular}.`}
    />
  );
};

TransportManagement.propTypes = {
  type: PropTypes.oneOf(['trains', 'movies', 'buses']).isRequired,
  data: PropTypes.array.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onViewItem: PropTypes.func,
  onEditItem: PropTypes.func,
  onDeleteItem: PropTypes.func,
};

export default TransportManagement;