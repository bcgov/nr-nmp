/**
 * @summary A reusable Select component
 */
import { ComponentProps, useEffect, useMemo } from 'react';
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
  // Note: sort function must return number, no booleans
  sortFunction?: SortFunction;
  noSort?: boolean;
  autoselectFirst?: boolean;
};

const defaultSortFcn = (a: ListBoxItemProps, b: ListBoxItemProps) => {
  if (a.label < b.label) return -1;
  if (b.label > a.label) return 1;
  return 0;
};

function Select({
  sortFunction,
  noSort,
  autoselectFirst,
  selectedKey,
  onSelectionChange,
  items,
  ...props
}: ThisComponentProps & ComponentProps<typeof BcGovSelect>) {
  let selectedSortFcn: SortFunction | undefined;
  if (!noSort) {
    if (sortFunction) {
      selectedSortFcn = sortFunction;
    } else {
      selectedSortFcn = defaultSortFcn;
    }
  }
  const sortedItems = useMemo(() => items?.sort(selectedSortFcn), [items, selectedSortFcn]);

  useEffect(() => {
    if (autoselectFirst && onSelectionChange && sortedItems && sortedItems.length > 0) {
      if (selectedKey === null || selectedKey === undefined) {
        onSelectionChange(sortedItems[0].id!);
      } else if (!sortedItems.some((elem) => elem.id === selectedKey)) {
        onSelectionChange(sortedItems[0].id!);
      }
    }
  }, [autoselectFirst, selectedKey, sortedItems, onSelectionChange]);

  return (
    <BcGovSelect
      {...props}
      items={sortedItems}
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
    />
  );
}

export default Select;
