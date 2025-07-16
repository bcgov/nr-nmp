/**
 * @summary A reusable Select component
 */
import { ComponentProps } from 'react';
import { Select as BcGovSelect } from '@bcgov/design-system-react-components';

// Copied from @bcgov/design-system-react-components library
// because they don't export their types
interface ListBoxItemProps {
  [key: string]: any;
  label: string;
  id: string;
}

type SortFunction = (a: any, b: any) => -1 | 0 | 1;

type ThisComponentProps = {
  sortFunction?: SortFunction;
  noSort?: boolean;
};

function Select({
  // Note: sort function must return number, no booleans
  sortFunction,
  noSort,
  ...props
}: ThisComponentProps & ComponentProps<typeof BcGovSelect>) {
  const { items } = props;
  let selectedSortFcn: SortFunction = () => 0;

  const defaultSortFcn = (a: ListBoxItemProps, b: ListBoxItemProps) => {
    if (a.label < b.label) return -1;
    if (b.label > a.label) return 1;
    return 0;
  };

  if (!noSort) {
    if (sortFunction) {
      selectedSortFcn = sortFunction;
    } else {
      selectedSortFcn = defaultSortFcn;
    }
  }
  return (
    <BcGovSelect
      {...props}
      items={items?.sort(selectedSortFcn)}
    />
  );
}

export default Select;
