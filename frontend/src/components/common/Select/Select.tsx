/**
 * @summary A reusable Select component
 */
import { ComponentProps, useEffect, useMemo } from 'react';
import { Select as BcGovSelect } from '@bcgov/design-system-react-components';
import { Key } from 'react-aria-components';

// Copied from @bcgov/design-system-react-components library
// because they don't export their types
interface ListBoxItemProps {
  [key: string]: any;
  label: string;
  id: string; // if id is false-y, the label is used as the Key
}

type SortFunction = (a: any, b: any) => -1 | 0 | 1;

type ThisComponentProps = {
  // Note: sort function must return number, no booleans
  sortFunction?: SortFunction;
  noSort?: boolean;
  autoselectFirst?: boolean;
  autoselectDefault?: Key;
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
  autoselectDefault,
  value,
  onChange,
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
  const sortedItems = useMemo(
    () => items?.sort(selectedSortFcn),
    [items, selectedSortFcn],
  );

  useEffect(() => {
    if (!onChange || !sortedItems || sortedItems.length === 0
      || sortedItems.some((elem) => elem.id === value)
    ) {
      return;
    }

    if (autoselectDefault !== undefined
      && sortedItems.some((elem) => elem.id === autoselectDefault)
    ) {
      onChange(autoselectDefault);
      return;
    }
    if (autoselectFirst) {
      onChange(sortedItems[0].id!);
    }
  }, [autoselectFirst, autoselectDefault, value, sortedItems, onChange]);

  return (
    <BcGovSelect
      {...props}
      items={sortedItems}
      value={value}
      onChange={onChange}
    />
  );
}

export default Select;
