import AnimalFormWrapper from './AnimalFormWrapper';

type UnselectedAnimalProps = {
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  onCancel: () => void;
};

export default function UnselectedAnimal({ handleInputChanges, onCancel }: UnselectedAnimalProps) {
  return (
    <AnimalFormWrapper
      selectedAnimalId={undefined}
      handleInputChanges={handleInputChanges}
      onCancel={onCancel}
      onSubmit={() => {}}
      isConfirmDisabled
    >
      {null}
    </AnimalFormWrapper>
  );
}
