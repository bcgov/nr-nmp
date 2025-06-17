import { useCollapse, UseCollapseInput } from 'react-collapsed';

export class ExpandEvent extends Event {
  public initiator: string;

  constructor(initiator: string) {
    super('expand');
    this.initiator = initiator;
  }
}

interface UseEventfulCollapseInput extends UseCollapseInput {
  id: string | number;
}

export function useEventfulCollapse(settings: UseEventfulCollapseInput) {
  const { isExpanded, setExpanded, getCollapseProps, getToggleProps } = useCollapse({
    ...settings,
    onTransitionStateChange: (state) => {
      if (state === 'expandStart') {
        window.dispatchEvent(new ExpandEvent(settings.id.toString()));
      }
    },
  });
  window.addEventListener('expand', (e) => {
    // If this is not the initiating element, collapse it
    if ((e as ExpandEvent).initiator === settings.id) return;
    setExpanded(false);
  });
  return {
    isExpanded,
    setExpanded,
    getCollapseProps,
    getToggleProps,
  };
}
