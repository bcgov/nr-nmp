import { Button } from '../../components/common';

export default function LandingPage() {
  return (
    <div>
      <h1>Welcome to the Landing Page!</h1>
      <Button
        handleClick={() => console.log('Button clicked')}
        variant="primary"
        size="md"
        disabled={false}
        text="Click Me!"
      />
    </div>
  );
}
