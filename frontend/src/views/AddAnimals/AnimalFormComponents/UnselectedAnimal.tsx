import { SelectOption } from '@/types';
import AnimalFormWrapper from './AnimalFormWrapper';

type UnselectedAnimalProps = {
  animalOptions: SelectOption[];
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  onCancel: () => void;
};

export default function UnselectedAnimal(props: UnselectedAnimalProps) {
  return (
    <AnimalFormWrapper
      selectedAnimalId={undefined}
      onSubmit={() => {}}
      isConfirmDisabled
      {...props}
    >
      {null}
    </AnimalFormWrapper>
  );
}
